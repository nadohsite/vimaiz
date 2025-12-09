import { Config, RouteParam, RouteParamsWithQueryOverload, Router } from 'ziggy-js';

declare global {
    var Ziggy: Config;
    var route: {
        (
            name?: string,
            params?: RouteParamsWithQueryOverload | RouteParam,
            absolute?: boolean,
            config?: Config,
        ): string;
        (
            name?: string,
            params?: RouteParamsWithQueryOverload | RouteParam,
            absolute?: boolean,
            config?: Config,
        ): Router;
    };
}
