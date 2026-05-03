import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, FileText, User, Calendar, MapPin, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateCoverLetter as generateCoverLetterApi, hasReachedFreeLimit, getRemainingGenerations, getUserApiKey, incrementGenerationCount, setUserApiKey } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ItemStatus {
  completed: boolean;
  hasIssue: boolean;
  issueDescription: string;
  aiSuggestion: string;
}

interface CoverLetterGeneratorProps {
  itemStatuses: Record<number, ItemStatus>;
  onBack: () => void;
}

interface PersonalInfo {
  name: string;
  passportNumber: string;
  travelPurpose: string;
  travelDates: string;
  itinerary: string;
}

const CoverLetterGenerator = ({ itemStatuses, onBack }: CoverLetterGeneratorProps) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    passportNumber: "",
    travelPurpose: "",
    travelDates: "",
    itinerary: ""
  });
  
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const generationCount = getRemainingGenerations();
  const { toast } = useToast();

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateCoverLetter = async () => {
    if (hasReachedFreeLimit() && !getUserApiKey()) {
      setShowApiKeyDialog(true);
      return;
    }

    setIsGenerating(true);
    
    try {
      const completedItems = Object.entries(itemStatuses)
        .filter(([_, status]) => status.completed)
        .map(([id]) => {
          const itemNamesEn: Record<number, string> = {
            1: "France-Visas application form and receipt",
            2: "Passport",
            3: "Passport photos",
            4: "Flight reservation",
            5: "Hotel booking confirmation",
            6: "Travel insurance",
            7: "Bank statements",
            8: "Employment certificate",
            9: "Business license",
            10: "Household registration booklet",
            11: "Identity card",
            12: "Travel itinerary",
            13: "Other fixed asset proofs",
            14: "Marriage status certificate",
            15: "TLScontact appointment confirmation",
            16: "Other supplementary materials"
          };
          return itemNamesEn[parseInt(id)];
        });
      
      const issueItems = Object.entries(itemStatuses)
        .filter(([_, status]) => status.hasIssue)
        .map(([id, status]) => ({ id: parseInt(id), description: status.issueDescription }));

      const letter = await generateCoverLetterApi(personalInfo, completedItems, issueItems);
      setGeneratedLetter(letter);
      
      if (!getUserApiKey()) {
        incrementGenerationCount();
      }
      
      const remaining = getUserApiKey() ? -1 : getRemainingGenerations();
      toast({
        title: "Cover Letter生成成功",
        description: remaining === -1 ? "您的签证申请信已生成完成" : `您的签证申请信已生成完成 (剩余${remaining}次)`
      });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSetApiKey = () => {
    if (!customApiKey.trim()) {
      toast({
        title: "API Key无效",
        description: "请输入有效的API Key",
        variant: "destructive"
      });
      return;
    }
    setUserApiKey(customApiKey.trim());
    setShowApiKeyDialog(false);
    setCustomApiKey('');
    toast({
      title: "API Key设置成功",
      description: "现在您可以无限制使用AI服务"
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast({
      title: "已复制到剪贴板",
      description: "Cover Letter内容已复制，您可以粘贴使用"
    });
  };

  const downloadLetter = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `France_Visa_Cover_Letter_${personalInfo.name || 'Applicant'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下载完成",
      description: "Cover Letter已保存到您的设备"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          ← 返回清单
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cover Letter生成器
          </h1>
          <p className="text-muted-foreground">填写个人信息以生成专业的签证申请信</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              个人信息
            </CardTitle>
            <CardDescription>
              请填写以下信息以个性化您的Cover Letter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名（英文）</Label>
              <Input
                id="name"
                value={personalInfo.name}
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
                placeholder="如：Zhang San"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passport">护照号码</Label>
              <Input
                id="passport"
                value={personalInfo.passportNumber}
                onChange={(e) => updatePersonalInfo('passportNumber', e.target.value)}
                placeholder="如：E12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">旅行目的</Label>
              <Textarea
                id="purpose"
                value={personalInfo.travelPurpose}
                onChange={(e) => updatePersonalInfo('travelPurpose', e.target.value)}
                placeholder="详细描述您去法国的目的，如：观光旅游、探访朋友、商务考察等"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dates">旅行日期</Label>
              <Input
                id="dates"
                value={personalInfo.travelDates}
                onChange={(e) => updatePersonalInfo('travelDates', e.target.value)}
                placeholder="如：2024年6月15日至2024年6月30日"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itinerary">行程安排</Label>
              <Textarea
                id="itinerary"
                value={personalInfo.itinerary}
                onChange={(e) => updatePersonalInfo('itinerary', e.target.value)}
                placeholder="简要描述您的行程安排，包括计划访问的城市和景点"
                rows={4}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>生成次数</span>
                <span>{getUserApiKey() ? '无限制' : `${3 - generationCount}/3`}</span>
              </div>
              <Button
                onClick={handleGenerateCoverLetter}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-200"
                disabled={isGenerating || !personalInfo.name || !personalInfo.passportNumber || (getUserApiKey() ? false : generationCount >= 3)}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "正在生成..." : getUserApiKey() ? "生成Cover Letter" : generationCount >= 3 ? "已达到生成限制" : "生成Cover Letter"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              生成的Cover Letter
            </CardTitle>
            <CardDescription>
              您的个性化签证申请信
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedLetter ? (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto p-4 bg-muted/50 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedLetter}
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                  <Button onClick={downloadLetter} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>填写左侧信息并点击生成按钮</p>
                <p className="text-sm">我们将为您创建专业的Cover Letter</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              设置API Key
            </DialogTitle>
            <DialogDescription>
              您已达到免费生成次数限制。输入您自己的GLM API Key以继续使用AI服务。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">GLM API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="请输入您的GLM API Key"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                获取API Key：访问智谱AI官网 (https://open.bigmodel.cn/) 注册并获取API Key
              </p>
              <p className="text-sm text-muted-foreground">
                设置后您将无限制使用AI建议和Cover Letter生成功能
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowApiKeyDialog(false);
                setCustomApiKey('');
              }}
            >
              取消
            </Button>
            <Button onClick={handleSetApiKey}>
              确认设置
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoverLetterGenerator;
