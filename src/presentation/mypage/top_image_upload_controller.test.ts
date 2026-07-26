import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { BadRequestError } from "../../application_service/shared/exception/application_error";
import type { AppEnv } from "../../cmd/types/app_env";
import { CompleteTopImageUploadController } from "./complete_top_image_upload_controller";
import { PrepareTopImageUploadController } from "./prepare_top_image_upload_controller";

const memberId = "00000000-0000-4000-8000-000000000001";
const uploadId = "00000000-0000-4000-8000-000000000002";

const createApp = () => {
  const prepareController = new PrepareTopImageUploadController({
    async execute() {
      return {
        url: "https://bucket.s3.example.com",
        fields: { key: "pending/key.jpg", policy: "policy" },
        uploadId,
      };
    },
  });
  const completeController = new CompleteTopImageUploadController({
    async execute() {
      return {
        topImageUrl: `https://cdn.example.com/photos/${memberId}/${uploadId}.jpg`,
      };
    },
  });
  const app = new Hono<AppEnv>();
  app.use("*", async (c, next) => {
    c.set("memberId", memberId);
    await next();
  });
  app.post("/prepare", (c) => prepareController.handle(c));
  app.post("/complete", (c) => completeController.handle(c));
  app.onError((error, c) => {
    if (error instanceof BadRequestError) {
      return c.json({ error: error.code }, 400);
    }
    throw error;
  });
  return app;
};

describe("トップ画像2段階アップロードController", () => {
  it("prepareレスポンスを返す", async () => {
    const response = await createApp().request("/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: "image/jpeg" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      url: "https://bucket.s3.example.com",
      fields: { key: "pending/key.jpg", policy: "policy" },
      uploadId,
    });
  });

  it("completeレスポンスを返す", async () => {
    const response = await createApp().request("/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, contentType: "image/jpeg" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      topImageUrl: `https://cdn.example.com/photos/${memberId}/${uploadId}.jpg`,
    });
  });

  it.each(["/prepare", "/complete"])("%s の不正JSONを400にする", async (path) => {
    const response = await createApp().request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "BAD_REQUEST" });
  });
});
