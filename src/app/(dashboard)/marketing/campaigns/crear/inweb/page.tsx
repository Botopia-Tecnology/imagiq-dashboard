"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Monitor,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { InWebPreview } from "@/components/campaigns/inweb/inweb-preview";
import {
  AudienceSegmentation,
  AudienceSegmentationData,
} from "@/components/campaigns/audience-segmentation";
import {
  CampaignInfo,
  CampaignInfoData,
} from "@/components/campaigns/inweb/campaign-info";
import {
  BehaviorSettings,
  BehaviorSettingsData,
} from "@/components/campaigns/inweb/behavior-settings";
import {
  NotificationContent,
  NotificationContentData,
} from "@/components/campaigns/inweb/notification-content";
import {
  SchedulingSettings,
  SchedulingSettingsData,
} from "@/components/campaigns/inweb/scheduling-settings";

export default function CrearCampaignInWebPage() {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const [inWebData, setInWebData] = useState<{
    campaignName: string;
    campaignType: string;
    targetAudience: string;

    image: string;
    url: string;
    previewUrl: string;
    displayStyle: "popup" | "slider";
    selectedCities: string[];
    purchaseOperator: string;
    purchaseCount: number;
    minAge: number;
    maxAge: number;
    sendImmediately: boolean;
    scheduledDate: Date | null;
    enableFrequencyCap: boolean;
    maxPerDay: number;
    maxPerWeek: number;
    enableABTest: boolean;
    abTestPercentage: number;
    ttl: number;
    urgency: string;
    enableFallback: boolean;
    contentType: "image" | "html";
    htmlContent: string;
  }>({
    // Campaign Info
    campaignName: "",
    campaignType: "promotional",
    targetAudience: "all",

    // Notification Content
    image: "",
    url: "",
    previewUrl: "",



    // Behavior Settings
    displayStyle: "popup", // "popup" (bloqueante) o "slider" (tipo toast)

    // Audience Segmentation
    selectedCities: [] as string[],
    purchaseOperator: "equal",
    purchaseCount: 0,
    minAge: 18,
    maxAge: 65,

    // Timing
    sendImmediately: true,
    scheduledDate: null as Date | null,

    // Frequency Capping
    enableFrequencyCap: false,
    maxPerDay: 3,
    maxPerWeek: 10,

    // A/B Testing
    enableABTest: false,
    abTestPercentage: 50,

    // Advanced
    ttl: 10, // 24 hours in seconds
    urgency: "normal",
    enableFallback: true,

    // Content Type
    contentType: "image",
    htmlContent: "",
  });



  const handleGoBack = () => {
    router.push("/marketing/campaigns");
  };

  const handleSave = () => {
    console.log("Guardando campaña InWeb:", inWebData);
  };

  const handleSend = () => {
    console.log("Enviando campaña InWeb:", inWebData);
  };

  const handleCampaignInfoChange = (data: CampaignInfoData) => {
    setInWebData((prev) => ({ ...prev, ...data }));
  };

  const handleSegmentationChange = (
    segmentationData: AudienceSegmentationData
  ) => {
    setInWebData((prev) => ({
      ...prev,
      ...segmentationData,
    }));
  };

  const handleBehaviorSettingsChange = (data: BehaviorSettingsData) => {
    setInWebData((prev) => ({ ...prev, ...data }));
  };

  const handleNotificationContentChange = (data: NotificationContentData) => {
    setInWebData((prev) => ({ ...prev, ...data }));
  };

  const handleSchedulingSettingsChange = (data: SchedulingSettingsData) => {
    setInWebData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="space-y-3">
      {/* Sticky Header con botón Volver y Vista Previa - debajo del header del layout */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-3 -mx-4 px-4">
        <div className="flex items-center justify-between gap-4">
          {/* Lado izquierdo: Volver y Título */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Crear Campaña InWeb
              </h1>
            </div>
          </div>

          {/* Lado derecho: Vista Previa con tabs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span className="font-semibold">Vista Previa</span>
            </div>
            <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as "desktop" | "mobile")}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="desktop" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Desktop
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Móvil
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Form */}
        <div className="space-y-3">
          {/* Campaign Info */}
          <CampaignInfo
            data={{
              campaignName: inWebData.campaignName,
              campaignType: inWebData.campaignType,
            }}
            onChange={handleCampaignInfoChange}
          />

          {/* Audience Segmentation */}
          <AudienceSegmentation
            data={{
              targetAudience: inWebData.targetAudience,
              selectedCities: inWebData.selectedCities,
              purchaseOperator: inWebData.purchaseOperator,
              purchaseCount: inWebData.purchaseCount,
              minAge: inWebData.minAge,
              maxAge: inWebData.maxAge,
            }}
            onChange={handleSegmentationChange}
          />

          {/* Behavior Settings */}
          <BehaviorSettings
            data={{
              displayStyle: inWebData.displayStyle,
              enableFrequencyCap: inWebData.enableFrequencyCap,
              maxPerDay: inWebData.maxPerDay,
              maxPerWeek: inWebData.maxPerWeek,
              ttl: inWebData.ttl,
              urgency: inWebData.urgency,
            }}
            onChange={handleBehaviorSettingsChange}
          />

          {/* Notification Content */}
          <NotificationContent
            data={{
              contentType: inWebData.contentType,
              image: inWebData.image,
              url: inWebData.url,
              previewUrl: inWebData.previewUrl,
              htmlContent: inWebData.htmlContent,
            }}
            onChange={handleNotificationContentChange}
          />

          {/* Scheduling */}
          <SchedulingSettings
            data={{
              sendImmediately: inWebData.sendImmediately,
              scheduledDate: inWebData.scheduledDate,
              enableABTest: inWebData.enableABTest,
              abTestPercentage: inWebData.abTestPercentage,
            }}
            onChange={handleSchedulingSettingsChange}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSave} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Guardar Borrador
            </Button>
            <Button onClick={handleSend} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Crear
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <div className="sticky top-[110px]">
            <InWebPreview
              image={inWebData.image}
              previewUrl={inWebData.previewUrl}
              displayStyle={inWebData.displayStyle}
              contentType={inWebData.contentType}
              htmlContent={inWebData.htmlContent}
              mode={previewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
