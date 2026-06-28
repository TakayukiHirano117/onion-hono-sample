import { Context } from "hono";
import { Hono } from "hono";
import { LoginController } from "./members/login_controller";
import { LogoutController } from "./members/logout_controller";

export class AuthController {
  constructor(
    private readonly _loginController: LoginController,
    private readonly _logoutController: LogoutController
  ) {}

  setUpRoutes = () => {
    const router = new Hono();

    // members
    router.post("/members/login", (c: Context) => this._loginController.handle(c));
    router.post("/members/logout", (c: Context) => this._logoutController.handle(c));

    return router;
  };
}