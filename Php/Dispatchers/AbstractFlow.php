<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright (c) 2009-2014 Webiny LTD. (http://www.webiny.com/)
 * @license   http://www.webiny.com/platform/license
 */

namespace Apps\Core\Php\Dispatchers;

use Apps\Core\Php\DevTools\DevToolsTrait;
use Apps\Core\Php\DevTools\Entity\EntityAbstract;
use Webiny\Component\StdLib\StdLibTrait;

abstract class AbstractFlow
{
    use DevToolsTrait, StdLibTrait, ParamsInjectorTrait;

    abstract public function canHandle($httpMethod, $params);

    abstract public function handle(EntityAbstract $entity, $params);

    protected function isValidMongoId($str)
    {
        try {
            $id = new \MongoId($str);
        } catch (\MongoException $e) {
            return false;
        }


        return (string)$id === $str;
    }

    protected function toCamelCase($str)
    {
        return $this->str($this->toPascalCase($str))->caseFirstLower()->val();
    }

    protected function toPascalCase($str)
    {
        return $this->str($str)->replace('-', ' ')->caseWordUpper()->replace(' ', '')->val();
    }
}