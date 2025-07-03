"use client";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart3 } from "lucide-react";

export default function Onboarding() {
  const { primaryWallet } = useDynamicContext();
  const router = useRouter();

  // Redirect when wallet connects
  useEffect(() => {
    if (primaryWallet?.address) {
      router.push('/');
    }
  }, [primaryWallet?.address, router]);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Blurred Background Content */}
      <div className="absolute inset-0 blur-sm opacity-20">
        <div className="bg-gradient-to-br from-usdt to-primary-600 h-full"></div>
      </div>
      
      {/* Onboarding Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-md">
          <div className="w-20 h-20 bg-usdt rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to RariKo
            </h1>
            <p className="text-gray-400 text-lg">
              Connect your wallet to start trading tokenized US stocks
            </p>
          </div>

          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
            <DynamicWidget />
          </div>

          <div className="text-sm text-gray-500">
            <p>Secure • Fast • Reliable</p>
          </div>
        </div>
      </div>
    </div>
  );
} 