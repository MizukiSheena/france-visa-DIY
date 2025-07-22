import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, FileText, User, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [generationCount, setGenerationCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const { toast } = useToast();

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCoverLetter = async () => {
    if (generationCount >= 3) {
      setHasReachedLimit(true);
      toast({
        title: "生成次数已用完",
        description: "您已达到3次生成限制",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const completedItems = Object.entries(itemStatuses)
        .filter(([_, status]) => status.completed)
        .map(([id]) => parseInt(id));
      
      const issueItems = Object.entries(itemStatuses)
        .filter(([_, status]) => status.hasIssue)
        .map(([id, status]) => ({ id: parseInt(id), description: status.issueDescription }));

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

      // Call GPT API to generate personalized cover letter
      const response = await fetch('https://aigc.sankuai.com/v1/openai/native/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 21896386967961661493',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: [
            {
              role: "user",
              content: `Please generate a professional and polite cover letter in English for a France visa application based on the following information:

Personal Information:
- Name: ${personalInfo.name}
- Passport Number: ${personalInfo.passportNumber}
- Travel Purpose (in Chinese): ${personalInfo.travelPurpose}
- Travel Dates (in Chinese): ${personalInfo.travelDates}
- Itinerary (in Chinese): ${personalInfo.itinerary}

Completed Documents:
${completedItems.map(id => `- ${itemNamesEn[id]}`).join('\n')}

Documents with Issues:
${issueItems.map(item => `- ${itemNamesEn[item.id]}: ${item.description}`).join('\n')}

Requirements:
1. Translate any Chinese information into natural English
2. Expand on travel purposes with realistic details about why visiting France
3. Provide professional explanations for any document issues
4. Emphasize strong ties to China and intention to return
5. Use formal, respectful tone appropriate for visa application
6. Include all standard sections: purpose, itinerary, documents, ties to China, financial capacity, compliance commitment
7. Make it personalized based on the provided information

The letter should be comprehensive, professional, and persuasive while maintaining honesty about any document limitations.`
            }
          ],
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error('API调用失败');
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      setGeneratedLetter(generatedContent);
      setGenerationCount(prev => prev + 1);
      setIsGenerating(false);
      
      toast({
        title: "Cover Letter生成成功",
        description: `您的签证申请信已生成完成 (剩余${2 - generationCount}次)`
      });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setIsGenerating(false);
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
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
                <span>{generationCount}/3</span>
              </div>
              <Button
                onClick={generateCoverLetter}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-200"
                disabled={isGenerating || !personalInfo.name || !personalInfo.passportNumber || generationCount >= 3}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isGenerating ? "正在生成..." : generationCount >= 3 ? "已达到生成限制" : "生成Cover Letter"}
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
    </div>
  );
};

export default CoverLetterGenerator;