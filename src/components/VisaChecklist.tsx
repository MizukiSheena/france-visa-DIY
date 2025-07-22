import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Lightbulb,
  MessageSquare
} from "lucide-react";

interface VisaItem {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  tips: string[];
  hasCustomForm?: boolean;
}

interface ItemStatus {
  completed: boolean;
  hasIssue: boolean;
  issueDescription: string;
  aiSuggestion: string;
}

interface VisaChecklistProps {
  onGenerateCoverLetter: (data: Record<number, ItemStatus>) => void;
}

const VISA_ITEMS: VisaItem[] = [
  {
    id: 1,
    title: "France-Visas申请表和回执单",
    description: "官网：https://france-visas.gouv.fr/zh/web/france-visas/demande-en-ligne",
    requirements: [
      "选择中文",
      "下载填写指南",
      "点击'在线填写申请表格'",
      "注册账户后根据指南填写表格"
    ],
    tips: [
      "行程里停留时长最长的国家需要是法国",
      "看到三角形注意符号显示you need a visa，不用担心，点击next",
      "填写后会生成FRA号码，请记录下来，以便去TLS官网进行递签预约",
      "只要填写一部分就可以生成FRA号码，酒店信息等未定则可以先不填写，递签并确定后，再补充填写申请表",
      "出生地填写护照上的出生地（省/直辖市）",
      "电子邮箱地址建议为注册邮箱地址",
      "工作单位或学校的电话号码，如无，建议用相关负责人的电话，以防止电话调查",
      "是否去法国以外的国家：如果会去除法国以外的申根国家，包括转机，需要选yes",
      "计划到达/离开申根地区的时间：根据航班信息选择抵达首个申根国家/离开最后一个申根国家的日期",
      "首次进入的申根国家/地区：通常选法国，如从别的国家转机后到法国，则选别的国家",
      "下一年预计入境法国的次数：从法国到德国再到法国，算2次"
    ]
  },
  {
    id: 2,
    title: "护照",
    description: "有效护照原件及复印件",
    requirements: [
      "护照有效期至少超过预计离开申根区日期3个月",
      "护照至少有2页空白签证页",
      "提供护照原件和所有有信息页的复印件"
    ],
    tips: [
      "检查护照是否有损坏，如有需及时更换",
      "复印件要清晰，建议彩色复印",
      "旧护照上如有签证记录，也最好能提供复印件"
    ]
  },
  {
    id: 3,
    title: "照片",
    description: "近期彩色护照照片",
    requirements: [
      "35mm x 45mm尺寸（2寸）",
      "白色背景",
      "近6个月内拍摄",
      "露耳、露眉、不露齿",
      "2张"
    ],
    tips: [
      "建议到专业照相馆拍摄，递签处可能也有机器现场拍摄（需缴费）"
    ]
  },
  {
    id: 4,
    title: "机票预订单",
    description: "往返机票预订确认单",
    requirements: [
      "显示申请人姓名（与护照一致）",
      "明确的出入境日期",
      "航班号和航空公司信息",
      "预订确认号"
    ],
    tips: [
      "可以是预订单，不需要出票",
      "可以用香港携程预订，或者直接联系法航客服预订",
      "日期要与行程计划一致",
      "如果多人同行，每人都需要单独的预订单"
    ]
  },
  {
    id: 5,
    title: "酒店预订确认",
    description: "全程住宿预订确认单",
    requirements: [
      "覆盖整个行程期间",
      "显示申请人姓名",
      "酒店名称、地址、联系方式",
      "入住和退房日期"
    ],
    tips: [
      "可选择免费取消的酒店预订",
      "如住朋友家，需提供邀请函",
      "民宿预订也可以，但要有正式确认单",
      "确保预订日期与机票日期匹配"
    ]
  },
  {
    id: 6,
    title: "旅行保险",
    description: "申根旅行保险单",
    requirements: [
      "保险金额至少3万欧元",
      "覆盖整个申根区域",
      "保险期间覆盖整个行程（包括时差）"
    ],
    tips: [
      "一般彩色打印保单前三页盖鲜章部分即可",
      "选择知名保险公司",
      "保险单必须是英文或法文",
      "确认保险生效日期",
      "保留保险公司联系方式"
    ]
  },
  {
    id: 7,
    title: "银行流水",
    description: "近6个月银行账户流水单",
    requirements: [
      "显示申请人姓名",
      "近6个月的交易记录",
      "银行盖章或电子版带验证码",
      "距离递签1个月内",
      "余额充足支持旅行费用"
    ],
    tips: [
      "建议活期余额至少5万人民币",
      "避免临时大额存入",
      "工资收入要有规律体现",
      "如余额不足，可提供定期存款证明"
    ]
  },
  {
    id: 8,
    title: "在职证明",
    description: "工作单位出具的在职证明",
    requirements: [
      "公司抬头纸打印",
      "包含个人信息、职位、工资、工作年限",
      "批准假期的说明，包含行程日期、准假天数",
      "单位保证申请人回国后保留其职务",
      "负责人亲笔签名（需明确负责人身份、职位）",
      "包含公司联系方式，由公司盖章"
    ],
    tips: [
      "使用中英文对照版本",
      "退休人员提供退休证明"
    ]
  },
  {
    id: 9,
    title: "营业执照",
    description: "公司营业执照复印件（如适用）",
    requirements: [
      "营业执照副本复印件",
      "加盖公司公章",
      "在有效期内",
      "信息清晰可读，最好彩色复印"
    ],
    tips: [
      "个体户提供个体工商户营业执照",
      "如果是分公司，提供分公司营业执照",
      "确保执照信息与在职证明一致",
      "学生和退休人员无需提供",
      "公职/国有企业/社会组织人员，可以提供组织机构代码证号、解释信、工作证复印件、社保缴纳证明等"
    ]
  },
  {
    id: 10,
    title: "户口本",
    description: "户口本原件及所有信息页的复印件",
    requirements: [
      "信息清晰完整",
      "如有变更，需显示变更记录"
    ],
    tips: [
      "集体户口提供集体户口首页和个人页",
      "如户口本信息有误，需先到派出所更正",
      "复印件要清晰，建议彩色复印"
    ]
  },
  {
    id: 11,
    title: "身份证",
    description: "身份证原件及正反面复印件",
    requirements: [
      "身份证正反面在同一页",
      "信息清晰可读",
      "在有效期内",
      "与护照信息一致"
    ],
    tips: [
      "建议彩色复印",
      "带上原件"
    ]
  },
  {
    id: 12,
    title: "行程单",
    description: "详细的旅行行程安排",
    requirements: [
      "每日具体安排",
      "最好包含城市、景点、交通方式",
      "与机票酒店预订一致"
    ],
    tips: [
      "英文或法文",
      "时间安排要合理，行程不要过于紧密",
      "包含一些著名景点，但提前查询好景点不开放的日期"
    ],
    hasCustomForm: true
  },
  {
    id: 13,
    title: "其他固定资产证明",
    description: "其他资产证明文件",
    requirements: [
      "房产证复印件",
      "车辆行驶证复印件",
      "股票、基金等投资证明",
      "其他有价值资产证明"
    ],
    tips: [
      "有助于证明在国内的约束力",
      "房产证最好是本人名下",
      "资产越多，签证通过率越高"
    ]
  },
  {
    id: 14,
    title: "婚姻状况证明",
    description: "婚姻状况相关证明文件",
    requirements: [
      "结婚证复印件（已婚）",
      "离婚证复印件（离异）"
    ],
    tips: [
      "领取结婚/离婚证后需要至派出所户籍窗口，变更婚姻状况"
    ],
    hasCustomForm: true
  },
  {
    id: 15,
    title: "TLScontact预约单",
    description: "TLScontact官网预约确认单",
    requirements: [
      "使用France-Visas生成的FRA号码进行预约",
      "选择合适的递签时间和地点",
      "打印预约确认单",
      "确保预约信息与申请表一致"
    ],
    tips: [
      "官网：https://cn.tlscontact.com/cn/fra/login.php",
      "需要先在France-Visas填写申请表获得FRA号码",
      "建议提前预约，热门时段可能需要等待",
      "预约后可以修改时间，但建议尽量避免频繁更改",
      "递签当天需要携带预约确认单"
    ]
  },
  {
    id: 16,
    title: "其他补充材料",
    description: "根据个人情况提供的补充材料",
    requirements: [
      "学历和资格证明（如适用）",
      "纳税证明",
      "其他支持性文件"
    ],
    tips: [
      "学生提供学生证和在读证明",
      "任何能证明旅行目的的材料都有帮助"
    ]
  }
];

const VisaChecklist = ({ onGenerateCoverLetter }: VisaChecklistProps) => {
  const [itemStatuses, setItemStatuses] = useState<Record<number, ItemStatus>>({});
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const updateItemStatus = (id: number, updates: Partial<ItemStatus>) => {
    setItemStatuses(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const getItemStatus = (id: number): ItemStatus => {
    return itemStatuses[id] || {
      completed: false,
      hasIssue: false,
      issueDescription: "",
      aiSuggestion: ""
    };
  };

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const generateAISuggestion = async (id: number, issue: string) => {
    // 这里可以集成真实的AI API
    const suggestions: Record<number, string> = {
      1: "如果无法访问官网，可以尝试使用VPN或联系法国领事馆获取纸质申请表。确保所有信息填写准确，特别是出行日期和目的。",
      2: "如果护照有效期不足，请立即申请护照延期。如果空白页不够，可以申请加页服务。",
      3: "如果现有照片不符合要求，建议到专业证件照摄影店重新拍摄，确保符合申根签证标准。",
      4: "如果无法预订机票，可以通过旅行社代为预订，或者联系航空公司客服。确保预订单显示完整信息。",
      5: "如果住朋友家，需要朋友提供邀请函和住房证明。如果是民宿，确保平台能提供正式预订确认单。",
      6: "选择知名保险公司的申根旅游保险，确保保额达到3万欧元以上，覆盖整个行程期间。",
      7: "如果银行流水余额不足，可以提供定期存款证明、股票基金等资产证明作为补充。",
      8: "如果是自由职业者，可以提供税务登记证明、客户合同等证明工作稳定性的文件。",
      9: "如果是个体户或自由职业者，提供相应的营业执照或税务登记证明。学生和退休人员无需此项。",
      10: "如果是集体户口，提供集体户口首页复印件和个人页。确保信息与身份证一致。",
      11: "确保身份证在有效期内，如即将到期请及时更换。复印件要清晰完整。",
      12: "可以参考网上的行程模板，确保时间安排合理，包含主要景点和交通方式。",
      13: "提供任何能证明在国内有约束力的资产证明，如房产、车辆、投资等。",
      14: "根据实际婚姻状况提供相应证明，确保与户口本信息一致。",
      15: "需要先完成France-Visas申请表获得FRA号码，然后在TLS官网预约递签时间。",
      16: "根据个人情况提供相关补充材料，如学生证、工作证明等。"
    };

    const suggestion = suggestions[id] || "建议咨询专业的签证代理机构或法国领事馆获取针对性建议。";
    
    updateItemStatus(id, { aiSuggestion: suggestion });
  };

  const completedCount = Object.values(itemStatuses).filter(status => status.completed).length;
  const totalCount = VISA_ITEMS.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          法国签证材料清单
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="text-sm text-muted-foreground">
            进度: {completedCount}/{totalCount}
          </div>
          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-sm font-medium text-primary">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {VISA_ITEMS.map((item) => {
          const status = getItemStatus(item.id);
          const isExpanded = expandedItems.has(item.id);

          return (
            <Card key={item.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={status.completed}
                    onCheckedChange={(checked) => 
                      updateItemStatus(item.id, { completed: !!checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {status.completed && (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            已完成
                          </Badge>
                        )}
                        {status.hasIssue && (
                          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            有问题
                          </Badge>
                        )}
                        <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
                      </div>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          要求
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {item.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          提示
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {item.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox
                        checked={status.hasIssue}
                        onCheckedChange={(checked) => 
                          updateItemStatus(item.id, { hasIssue: !!checked })
                        }
                      />
                      <label className="text-sm font-medium">遇到问题需要AI建议</label>
                    </div>

                    {status.hasIssue && (
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">请描述您遇到的问题：</label>
                          <Textarea
                            value={status.issueDescription}
                            onChange={(e) => 
                              updateItemStatus(item.id, { issueDescription: e.target.value })
                            }
                            placeholder="详细描述您在准备这项材料时遇到的具体问题..."
                            rows={3}
                          />
                        </div>
                        
                        <Button
                          onClick={() => generateAISuggestion(item.id, status.issueDescription)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          获取AI建议
                        </Button>

                        {status.aiSuggestion && (
                          <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                            <h5 className="font-medium text-primary mb-2">AI建议：</h5>
                            <p className="text-sm">{status.aiSuggestion}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-6">
        <Button
          onClick={() => onGenerateCoverLetter(itemStatuses)}
          size="lg"
          className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-200"
          disabled={completedCount === 0}
        >
          <FileText className="w-5 h-5 mr-2" />
          生成Cover Letter
        </Button>
      </div>
    </div>
  );
};

export default VisaChecklist;