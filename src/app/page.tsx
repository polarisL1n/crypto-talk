"use client";

import { useState, useCallback } from "react";
import { Lock, Unlock, Copy, ShieldCheck, Loader2 } from "lucide-react";
import Toast, { type ToastType } from "@/components/Toast";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [resultLabel, setResultLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  }>({ message: "", type: "info", visible: false });

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, visible: true });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const callCryptoApi = async (action: "encrypt" | "decrypt") => {
    if (!inputText.trim()) {
      showToast(
        action === "encrypt"
          ? "请输入需要加密的文本"
          : "请输入需要解密的密文",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: inputText }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "操作失败", "error");
        return;
      }

      setResult(data.result);
      setResultLabel(action === "encrypt" ? "加密结果（密文）" : "解密结果（明文）");
      showToast(action === "encrypt" ? "加密成功！" : "解密成功！", "success");
    } catch {
      showToast("网络请求失败，请检查连接", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      showToast("已复制到剪贴板", "success");
    } catch {
      showToast("复制失败，请手动复制", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={closeToast}
      />

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            🔒 专属加密信使
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            服务端 AES 加密 · 密钥安全存储于环境变量
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-6">
          {/* Input Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 输入内容
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入需要加密的明文，或需要解密的密文..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400 bg-gray-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => callCryptoApi("encrypt")}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              文本加密
            </button>
            <button
              onClick={() => callCryptoApi("decrypt")}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              文本解密
            </button>
          </div>

          {/* Result Area */}
          {result && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  ✅ {resultLabel}
                </label>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  复制
                </button>
              </div>
              <textarea
                readOnly
                value={result}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 resize-none focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          密钥安全存储于服务端环境变量，不会暴露在前端代码中
        </p>
      </div>
    </div>
  );
}
