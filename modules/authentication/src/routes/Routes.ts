import {LocalHandlers} from '../handlers/auth/local';
import * as grpc from 'grpc';
import ConduitGrpcSdk, {
    ConduitError,
    ConduitRoute,
    ConduitRouteActions,
    ConduitRouteReturnDefinition, ConduitString,
    constructRoute,
    TYPE
} from '@conduit/grpc-sdk';
import {FacebookHandlers} from '../handlers/auth/facebook';
import {GoogleHandlers} from '../handlers/auth/google';
import {CommonHandlers} from '../handlers/auth/common';
import {isNil} from 'lodash';
import fs from "fs";
import path from "path";
import {ConduitRouteParameters} from "@conduit/grpc-sdk";

const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = __dirname + '/router.proto';

export class AuthenticationRoutes {
    private readonly localHandlers: LocalHandlers;
    private readonly facebookHandlers: FacebookHandlers;
    private readonly googleHandlers: GoogleHandlers;
    private readonly commonHandlers: CommonHandlers;

    constructor(server: grpc.Server, private readonly grpcSdk: ConduitGrpcSdk) {
        this.localHandlers = new LocalHandlers(grpcSdk);
        this.facebookHandlers = new FacebookHandlers(grpcSdk);
        this.googleHandlers = new GoogleHandlers(grpcSdk);
        this.commonHandlers = new CommonHandlers(grpcSdk);

        const packageDefinition = protoLoader.loadSync(
            PROTO_PATH,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            }
        );

        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        // @ts-ignore
        const router = protoDescriptor.authentication.router.Router;
        server.addService(router.service, {
            register: this.localHandlers.register.bind(this.localHandlers),
            authenticateLocal: this.localHandlers.authenticate.bind(this.localHandlers),
            forgotPassword: this.localHandlers.forgotPassword.bind(this.localHandlers),
            resetPassword: this.localHandlers.resetPassword.bind(this.localHandlers),
            verifyEmail: this.localHandlers.verifyEmail.bind(this.localHandlers),
            authenticateFacebook: this.facebookHandlers.authenticate.bind(this.facebookHandlers),
            authenticateGoogle: this.googleHandlers.authenticate.bind(this.googleHandlers),
            renewAuth: this.commonHandlers.renewAuth.bind(this.commonHandlers),
            logOut: this.commonHandlers.logOut.bind(this.commonHandlers),
            authMiddleware: this.middleware.bind(this)
        });
    }

    async registerRoutes(url: string) {

        let routerProtoFile = fs.readFileSync(path.resolve(__dirname, './router.proto'));
        let activeRoutes = await this.getRegisteredRoutes()
        this.grpcSdk.router
            .register(activeRoutes, routerProtoFile.toString('UTF-8'), url)
            .catch((err: Error) => {
                console.log('Failed to register routes for authentication module');
                console.log(err);
            });
    }

    async getRegisteredRoutes(): Promise<any[]> {
        let routesArray: any[] = [];

        let enabled = false;

        let errorMessage = null;
        let authActive = await this.localHandlers.validate().catch((e: any) => errorMessage = e);
        if (!errorMessage && authActive) {
            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication/local/new',
                    action: ConduitRouteActions.POST,
                    bodyParams: {
                        email: TYPE.String,
                        password: TYPE.String
                    }
                },
                new ConduitRouteReturnDefinition('RegisterResponse', 'String'),
                'register'
            )));

            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication/local',
                    action: ConduitRouteActions.POST,
                    bodyParams: {
                        email: TYPE.String,
                        password: TYPE.String
                    }
                },
                new ConduitRouteReturnDefinition('LoginResponse', {
                    userId: ConduitString.Required,
                    accessToken: ConduitString.Required,
                    refreshToken: ConduitString.Required
                }), 'authenticateLocal')));

            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication/forgot-password',
                    action: ConduitRouteActions.POST,
                    bodyParams: {
                        email: TYPE.String
                    }
                },
                new ConduitRouteReturnDefinition('ForgotPasswordResponse', 'String'),
                'forgotPassword'
            )));

            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication/reset-password',
                    action: ConduitRouteActions.POST,
                    bodyParams: {
                        passwordResetToken: TYPE.String,
                        password: TYPE.String
                    }
                },
                new ConduitRouteReturnDefinition('ResetPasswordResponse', 'String'),
                'resetPassword'
            )));

            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication/verify-email/:verificationToken',
                    action: ConduitRouteActions.GET,
                    urlParams: {
                        verificationToken: TYPE.String
                    }
                }, new ConduitRouteReturnDefinition('VerifyEmailResponse', 'String'),
                'verifyEmail'
            )));
            enabled = true;
        }
        errorMessage = null;
        authActive = await this.facebookHandlers.validate().catch((e: any) => errorMessage = e);
        if (!errorMessage && authActive) {
            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication/facebook',
                    action: ConduitRouteActions.POST,
                    bodyParams: {
                        // todo switch to required when the parsing is added
                        access_token: ConduitString.Optional
                    }
                },
                new ConduitRouteReturnDefinition('FacebookResponse', {
                    userId: ConduitString.Required,
                    accessToken: ConduitString.Required,
                    refreshToken: ConduitString.Required
                }),
                'authenticateFacebook'
            )));

            enabled = true;
        }

        errorMessage = null;
        authActive = await this.googleHandlers.validate().catch((e: any) => errorMessage = e);
        if (!errorMessage && authActive) {
            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication/google',
                    action: ConduitRouteActions.POST,
                    bodyParams: {
                        id_token: TYPE.String,
                        access_token: TYPE.String,
                        expires_in: TYPE.String
                    }
                },
                new ConduitRouteReturnDefinition('GoogleResponse', {
                    userId: ConduitString.Required,
                    accessToken: ConduitString.Required,
                    refreshToken: ConduitString.Required
                }),
                'authenticateGoogle'
            )));

            enabled = true;
        }

        if (enabled) {
            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication/renew',
                    action: ConduitRouteActions.POST,
                    bodyParams: {
                        refreshToken: TYPE.String
                    }
                },
                new ConduitRouteReturnDefinition('RenewAuthenticationResponse', {
                    accessToken: ConduitString.Required,
                    refreshToken: ConduitString.Required
                }),
                'renewAuth'
            )));

            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication/logout',
                    action: ConduitRouteActions.POST
                },
                new ConduitRouteReturnDefinition('LogoutResponse', 'String'),
                'logOut'
            )));

            routesArray.push(constructRoute(new ConduitRoute({
                    path: '/authentication',
                    action: ConduitRouteActions.POST
                },
                new ConduitRouteReturnDefinition('AuthMiddlewareResponse', 'String'),
                'authMiddleware'
            ), true));

        }
        return routesArray;
    }

    middleware(request: ConduitRouteParameters): Promise<any> {
        return new Promise((resolve, reject) => {
            const header = (request.headers['Authorization'] || request.headers['authorization']) as string;
            if (isNil(header)) {
                throw ConduitError.unauthorized();
            }
            const args = header.split(' ');

            const prefix = args[0];
            if (prefix !== 'Bearer') {
                throw ConduitError.unauthorized();
            }

            const token = args[1];
            if (isNil(token)) {
                throw ConduitError.unauthorized();
            }

            resolve(this.grpcSdk.databaseProvider!.findOne('AccessToken', {
                token,
                clientId: (request as any).context.clientId
            }))
        }).then((accessTokenDoc: any) => {
            if (isNil(accessTokenDoc)) {
                throw ConduitError.unauthorized();
            }

            return this.grpcSdk.databaseProvider!.findOne('User', {_id: accessTokenDoc.userId})
        })
            .then(user => {
                if (isNil(user)) {
                    throw ConduitError.notFound('User not found');
                }
                (request as any).context.user = user;
                return "ok";
            });

    }
}
