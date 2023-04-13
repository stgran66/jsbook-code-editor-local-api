"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = void 0;
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const path_1 = __importDefault(require("path"));
const serve = (port, filename, dir, useProxy) => {
    const app = (0, express_1.default)();
    if (useProxy) {
        app.use(express_1.default.static('./node_modules/local-client/build/index.html'));
        app.use((0, http_proxy_middleware_1.createProxyMiddleware)({
            target: 'http://127.0.0.1:3000',
            ws: true,
            logLevel: 'silent',
        }));
    }
    else {
        const packagePath = require.resolve('local-client/build/index.html');
        app.use(express_1.default.static(path_1.default.dirname(packagePath)));
    }
    return new Promise((resolve, reject) => {
        app.listen(port, resolve).on('error', reject);
        console.log('server running');
    });
};
exports.serve = serve;
