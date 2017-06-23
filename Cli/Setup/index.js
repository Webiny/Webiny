const Plugin = require('webiny/lib/plugin');
const Webiny = require('webiny/lib/webiny');
const inquirer = require('inquirer');
const yaml = require('js-yaml');
const generatePassword = require('password-generator');
const chalk = require('chalk');
const {magenta, white} = chalk;

const configs = {
    configSets: Webiny.projectRoot('Configs/ConfigSets.yaml'),
    base: {
        application: Webiny.projectRoot('Configs/Base/Application.yaml'),
        database: Webiny.projectRoot('Configs/Base/Database.yaml'),
        security: Webiny.projectRoot('Configs/Base/Security.yaml')
    },
    local: {
        application: Webiny.projectRoot('Configs/Local/Application.yaml')
    }
};

function setupVirtualHost(answers, callback) {
    // Create host file
    let hostFile = Webiny.readFile(__dirname + '/host.cfg');
    let server = answers.domain.replace('http://', '').replace('https://', '').split(':')[0];
    hostFile = hostFile.replace('{DOMAIN_HOST}', server);
    hostFile = hostFile.replace('{ABS_PATH}', Webiny.projectRoot());
    hostFile = hostFile.replace('{ERROR_LOG}', answers.errorLogFile);

    try {
        Webiny.writeFile(Webiny.projectRoot('vhost.conf'), hostFile);
        Webiny.success(white('Your nginx virtual host config was saved to ') + magenta('vhost.conf') + white(' file in your project root.'));
        Webiny.info('NOTE: you need to manually activate vhost config to finish the nginx setup.');

        callback(answers);
    } catch (err) {
        Webiny.failure(err);
    }
}

class Setup extends Plugin {
    constructor(program) {
        super(program);

        this.task = 'setup';
        this.selectApps = false;
    }

    runWizard(config, onFinish) {
        Webiny.log("\nNow we need to create a platform configuration and your first user:\n");

        const questions = [
            {
                type: 'input',
                name: 'domain',
                message: 'What\'s your local domain (e.g. http://domain.app:8001)?',
                validate: Webiny.validate.url
            },
            {
                type: 'input',
                name: 'database',
                message: 'What\'s your database name?',
                default: () => {
                    return 'Webiny';
                }
            },
            {
                type: 'input',
                name: 'user',
                message: 'Enter your admin user email:',
                validate: Webiny.validate.email
            },
            {
                type: 'password',
                name: 'password',
                message: 'Enter your admin user password:',
                validate: (value) => {
                    if (value !== 'dev' && value !== 'admin' && value.length < 8) {
                        return 'Please enter at least 8 characters!';
                    }

                    return true;
                }
            }
        ];

        return inquirer.prompt(questions).then(function (answers) {
            try {
                // Populate ConfigSets.yaml
                let config = yaml.safeLoad(Webiny.readFile(configs.configSets));
                config.ConfigSets.Local = answers.domain;
                Webiny.writeFile(configs.configSets, yaml.safeDump(config, {indent: 4}));

                // Populate Base/Application.yaml
                config = yaml.safeLoad(Webiny.readFile(configs.base.application));
                config.Application.Acl.Token = generatePassword(40, false, /[\dA-Za-z#_\$]/);
                Webiny.writeFile(configs.base.application, yaml.safeDump(config, {indent: 4}));

                // Populate Base/Database.yaml
                config = yaml.safeLoad(Webiny.readFile(configs.base.database));
                config.Mongo.Services.Webiny.Calls[0][1] = [answers.database];
                Webiny.writeFile(configs.base.database, yaml.safeDump(config, {indent: 4, flowLevel: 5}));

                // Populate Base/Security.yaml
                config = yaml.safeLoad(Webiny.readFile(configs.base.security));
                config.Security.Tokens.Webiny.SecurityKey = generatePassword(30, false, /[\dA-Za-z#_\$:\?#]/);
                Webiny.writeFile(configs.base.security, yaml.safeDump(config, {indent: 4, flowLevel: 5}));

                // Populate Local/Application.yaml
                config = yaml.safeLoad(Webiny.readFile(configs.local.application));
                config.Application.WebPath = answers.domain;
                config.Application.ApiPath = answers.domain + '/api';
                Webiny.writeFile(configs.local.application, yaml.safeDump(config, {indent: 4}));

                Webiny.success('Configuration files written successfully!');
            } catch (err) {
                console.log(err);
                return;
            }

            // Run Webiny installation procedure
            Webiny.shellExecute('php Apps/Webiny/Php/Cli/install.php Webiny', {stdio: 'pipe'});

            // Create admin user
            const params = [answers.domain, answers.user, answers.password].join(' ');
            try {
                let output = Webiny.shellExecute('php Apps/Webiny/Php/Cli/admin.php ' + params, {stdio: 'pipe'});
                output = JSON.parse(output);
                if (output.status === 'created') {
                    Webiny.success('Admin user created successfully!');
                }

                if (output.status === 'exists') {
                    Webiny.exclamation('Admin user already exists!');
                }
            } catch (err) {
                Webiny.failure(err.message);
            }

            // Virtual host wizard
            const hostAnswers = {
                domain: answers.domain
            };

            const createHost = function () {
                inquirer.prompt({
                    type: 'confirm',
                    name: 'createHost',
                    message: 'Would you like us to create a new nginx virtual host for you?',
                    default: true
                }).then(function (a) {
                    if (a.createHost) {
                        hostAnswers.createHost = true;
                        return errorLogFile();
                    }
                    onFinish(answers);
                });
            };

            const errorLogFile = function () {
                inquirer.prompt({
                    type: 'input',
                    name: 'errorLogFile',
                    message: 'Where do you want to place your error log file (including file name)?',
                    default: function () {
                        const server = answers.domain.replace('http://', '').replace('https://', '').split(':')[0];
                        return '/var/log/nginx/' + server + '-error.log';
                    }
                }).then(function (a) {
                    hostAnswers.errorLogFile = a.errorLogFile;
                    setupVirtualHost(hostAnswers, onFinish);
                });
            };

            try {
                Webiny.shellExecute('nginx -v', {stdio: 'pipe'});
                createHost();
            } catch (err) {
                // Skip host prompts
            }
        });
    }
}

module.exports = Setup;