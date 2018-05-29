import 'reflect-metadata';
import { EndpointConfig, Middleware, Request, Response } from '../index';

/**
 * Property Decorator Function
 *
 * Creates an endpoint of a function
 * The decorated function need the following index signature otherwise it will throw an error
 * (request: Request, response: Response, next?: Function) (also an indexsignature fore middlewares)
 * If you pass the next-function and call it, it will get the next function from the route middlewares
 * and abort the current execution
 * @returns
 *
 * @example
 * ```typescript
 *
 *   @Component({route: '/api'})
 *   class Test {
 *
 *      @Endpoint({
 *          route: '/foo'
 *          middleware: [(request: request) => request.params['foo'] = foo; ]
 *      )
 *      foo(request: Request, response: Response) {
 *          response
 *           .status(200)
 *           .json(request.params.foo)
 *           .send();
 *      }
 *   }
 * ```
 * **/
export function Endpoint(config: EndpointConfig) {
    const middleware = config.middleware || [];
    return (target: Object, key: string) => {
        checkHandlerFunctionIndexSignature(target, key);
        if (target['skeidjs'] && target['skeidjs'] instanceof Array) {
            (target['skeidjs'] as Array<EndpointHandler>).push({
                functionContextInstance: target,
                functionKey: key,
                route: config.route || '',
                middleware: middleware
            });
        }
        else {
            target['skeidjs'] = new Array<EndpointHandler>();
            (target['skeidjs'] as Array<EndpointHandler>).push({
                functionContextInstance: target,
                functionKey: key,
                route: config.route || '',
                middleware: middleware
            });
        }
    };
}

export interface EndpointHandler {
    functionContextInstance: Object;
    functionKey: string;
    route: string;
    middleware?: Middleware;
}

export function checkHandlerFunctionIndexSignature(target: Object, key: string) {
    const types = Reflect.getMetadata('design:paramtypes', target, key) || [null, null];
    if (types[0] !== Request || types[1] !== Response || types.length !== 2) {
        const errorMessage = `Index signature of ${key}(${types.map(a => a.name).join()}) does not fit (req Request, res Response) => void`;
        throw new Error(errorMessage);
    }
    if (types.length >= 3) {
        if (types[0] === Function) {
            const errorMessage = `Index signature of ${key}(${types.map(a => a.name).join()}) does not fit (req Request, res Response, next Function) => void`;
            throw new Error(errorMessage);
        }
    }
}
