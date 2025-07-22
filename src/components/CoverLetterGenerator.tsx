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
  const { toast } = useToast();

  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCoverLetter = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const completedItems = Object.entries(itemStatuses)
        .filter(([_, status]) => status.completed)
        .map(([id]) => parseInt(id));
      
      const issueItems = Object.entries(itemStatuses)
        .filter(([_, status]) => status.hasIssue)
        .map(([id, status]) => ({ id: parseInt(id), description: status.issueDescription }));

      const itemNames: Record<number, string> = {
        1: "France-Visas申请表和回执单",
        2: "护照",
        3: "照片",
        4: "机票预订单",
        5: "酒店预订确认",
        6: "旅行保险",
        7: "银行流水",
        8: "在职证明",
        9: "营业执照",
        10: "户口本",
        11: "身份证",
        12: "行程单",
        13: "其他固定资产证明",
        14: "婚姻状况证明",
        15: "TLScontact预约单",
        16: "其他补充材料"
      };

      const letter = `Dear Visa Officer,

I am writing to respectfully request a tourist visa to France. I am ${personalInfo.name}, a Chinese citizen holding passport number ${personalInfo.passportNumber}.

PURPOSE OF VISIT:
${personalInfo.travelPurpose || "I plan to visit France for tourism purposes, to experience the rich culture, history, and beautiful landscapes that France has to offer."}

TRAVEL DATES AND ITINERARY:
${personalInfo.travelDates || "My planned travel dates are [请填写具体日期]"}

${personalInfo.itinerary || "During my stay, I plan to visit major cities including Paris, Lyon, and Nice, exploring famous landmarks such as the Eiffel Tower, Louvre Museum, and the French Riviera."}

SUPPORTING DOCUMENTS:
I have prepared the following documents to support my visa application:

${completedItems.map(id => `• ${itemNames[id]}`).join('\n')}

${issueItems.length > 0 ? `
SPECIAL CIRCUMSTANCES:
I would like to explain the following circumstances regarding some of my documents:

${issueItems.map(item => `• ${itemNames[item.id]}: ${item.description}`).join('\n')}

Despite these circumstances, I have made every effort to provide alternative documentation and explanations to demonstrate my genuine intention to visit France and comply with all visa requirements.
` : ''}

TIES TO CHINA:
I have strong ties to China that ensure my return after my visit to France:
• Stable employment with my current company
• Family responsibilities and relationships in China
• Property and financial assets in China
• Educational and professional commitments requiring my presence in China

FINANCIAL CAPACITY:
I have sufficient financial resources to cover all expenses during my stay in France, as evidenced by my bank statements and supporting financial documents.

COMPLIANCE COMMITMENT:
I solemnly declare that:
• All information provided is true and accurate
• I will comply with all French laws and regulations during my stay
• I will not engage in any unauthorized activities
• I will depart France before my visa expires and return to China

I respectfully request that you grant me a tourist visa to France. I am confident that my application demonstrates both my genuine intention to visit France for tourism purposes and my commitment to returning to China after my visit.

Thank you for your time and consideration. I look forward to your favorable response.

Yours sincerely,

${personalInfo.name}
Date: ${new Date().toLocaleDateString('en-GB')}`;

      setGeneratedLetter(letter);
      setIsGenerating(false);
      
      toast({
        title: "Cover Letter生成成功",
        description: "您的签证申请信已生成完成"
      });
    }, 2000);
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

            <Button
              onClick={generateCoverLetter}
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-200"
              disabled={isGenerating || !personalInfo.name || !personalInfo.passportNumber}
            >
              <FileText className="w-4 h-4 mr-2" />
              {isGenerating ? "正在生成..." : "生成Cover Letter"}
            </Button>
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