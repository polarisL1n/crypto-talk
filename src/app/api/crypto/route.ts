import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

function getSecretKey(): Buffer {
  const key = process.env.CRYPTO_SECRET_KEY;
  if (!key) {
    throw new Error("CRYPTO_SECRET_KEY 环境变量未配置");
  }
  // 使用 SHA-256 将任意长度密钥转为 32 字节
  return crypto.createHash("sha256").update(key).digest();
}

function encrypt(text: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  // 将 iv + 密文拼接后转为 base64
  return Buffer.concat([iv, encrypted]).toString("base64");
}

function decrypt(cipherText: string, key: Buffer): string {
  const data = Buffer.from(cipherText, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const encrypted = data.subarray(IV_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export async function POST(request: NextRequest) {
  try {
    const { action, text } = await request.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "请输入需要处理的文本" },
        { status: 400 }
      );
    }

    if (action !== "encrypt" && action !== "decrypt") {
      return NextResponse.json(
        { error: "无效的操作类型" },
        { status: 400 }
      );
    }

    const secretKey = getSecretKey();

    if (action === "encrypt") {
      const result = encrypt(text, secretKey);
      return NextResponse.json({ result });
    }

    // decrypt
    try {
      const result = decrypt(text, secretKey);
      return NextResponse.json({ result });
    } catch {
      return NextResponse.json(
        { error: "解密失败：密文不完整或密钥错误" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "服务器内部错误，请检查环境变量配置" },
      { status: 500 }
    );
  }
}
