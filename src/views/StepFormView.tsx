import React, { useState } from 'react';
import { StepProgressBar } from '../components/business/step-form/StepProgressBar';
import type { StepItem } from '../components/business/step-form/StepProgressBar';
import { StepBasicInfoForm } from '../components/business/step-form/StepBasicInfoForm';
import type { StepBasicInfoData } from '../components/business/step-form/StepBasicInfoForm';
import { StepConfigDetailsForm } from '../components/business/step-form/StepConfigDetailsForm';
import type { StepConfigData } from '../components/business/step-form/StepConfigDetailsForm';
import { StepConfirmSummary } from '../components/business/step-form/StepConfirmSummary';
import { StepSubmitResult } from '../components/business/step-form/StepSubmitResult';

interface StepFormViewProps {
  onNavigate?: (path: string) => void;
}

const STEPS: StepItem[] = [
  { id: 1, title: '基础信息', description: '填写工单与业务类别' },
  { id: 2, title: '高级配置', description: '指定审批人与密级' },
  { id: 3, title: '信息确认', description: '预览并签署合规条约' },
  { id: 4, title: '提交完成', description: '生成流水号与审计流' },
];

export const StepFormView: React.FC<StepFormViewProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState('');

  const [basicInfo, setBasicInfo] = useState<StepBasicInfoData>({
    title: '生产环境 Redis 缓存集群规格扩容',
    category: '基础架构与云资源',
    priority: 'P1',
    department: '架构运维中心',
    description: '由于 Q3 运营活动流量增长，预计 Redis 主从集群 IOPS 将达峰值，需申请扩容内存与读写节点。',
  });

  const [configData, setConfigData] = useState<StepConfigData>({
    approver: 'usr-1',
    securityLevel: 'confidential',
    notifyWebhook: 'https://oapi.dingtalk.com/robot/send?access_token=demo_token_123',
    autoExecute: true,
    timeoutHours: 24,
  });

  const handleUpdateBasic = (data: Partial<StepBasicInfoData>) => {
    setBasicInfo(prev => ({ ...prev, ...data }));
  };

  const handleUpdateConfig = (data: Partial<StepConfigData>) => {
    setConfigData(prev => ({ ...prev, ...data }));
  };

  const handleSubmitOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `WO-2026${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedOrderId(generatedId);
      setIsSubmitting(false);
      setCurrentStep(4);
    }, 1200);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSubmittedOrderId('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header title banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            分步表单模版 (Step Wizard Template)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            适用于复杂业务申请、高风险部署变更、云资源提效配置等分步引导场景。
          </p>
        </div>
      </div>

      {/* Step progress bar component */}
      <StepProgressBar
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={step => step < currentStep && setCurrentStep(step)}
      />

      {/* Step Content Container */}
      <div className="max-w-4xl mx-auto">
        {currentStep === 1 && (
          <StepBasicInfoForm
            formData={basicInfo}
            onChange={handleUpdateBasic}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepConfigDetailsForm
            configData={configData}
            onChange={handleUpdateConfig}
            onPrev={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StepConfirmSummary
            basicInfo={basicInfo}
            configData={configData}
            onPrev={() => setCurrentStep(2)}
            onSubmit={handleSubmitOrder}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 4 && (
          <StepSubmitResult
            orderId={submittedOrderId}
            onViewDetail={() => onNavigate && onNavigate('/resource-list')}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};
