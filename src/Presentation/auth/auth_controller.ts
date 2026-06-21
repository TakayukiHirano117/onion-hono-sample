import { Context } from "hono";
import { Hono } from "hono";
import { LoginController } from "./members/login_controller";

export class AuthController {
  constructor(
    private readonly _loginController: LoginController
  ) {}

  setUpRoutes = () => {
    const router = new Hono();

    // members
    router.post("/members/login", (c: Context) => this._loginController.handle(c));

    return router;
  };
}