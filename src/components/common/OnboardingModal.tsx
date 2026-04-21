import { useState } from 'react'
import { Modal } from './Modal'
import { useSettingsStore } from '@/stores/settingsStore'

interface OnboardingModalProps {
  isOpen: boolean
}

export function OnboardingModal({ isOpen }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const { setTaxType, setHasEmployees, setOnboardingCompleted } = useSettingsStore()

  function handleTaxTypeSelect(type: 'general' | 'simplified') {
    setTaxType(type)
    setStep(2)
  }

  function handleHasEmployeesSelect(value: boolean) {
    setHasEmployees(value)
    setStep(3)
  }

  function handleComplete() {
    setOnboardingCompleted(true)
  }

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={stepTitle(step)}>
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            매출 규모에 따라 세금 신고 방식이 달라집니다.
          </p>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleTaxTypeSelect('general')}
              aria-pressed={false}
              className="flex flex-col items-start gap-1 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
            >
              <span className="font-semibold text-gray-800">일반과세자</span>
              <span className="text-xs text-gray-500">연 매출 1.04억 이상</span>
            </button>
            <button
              onClick={() => handleTaxTypeSelect('simplified')}
              aria-pressed={false}
              className="flex flex-col items-start gap-1 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
            >
              <span className="font-semibold text-gray-800">간이과세자</span>
              <span className="text-xs text-gray-500">연 매출 1.04억 미만</span>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <button
            onClick={() => setStep(1)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            ← 이전 단계
          </button>
          <p className="text-sm text-gray-600">
            직원이 있으면 매월 원천세 신고가 필요합니다.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleHasEmployeesSelect(true)}
              aria-pressed={false}
              className="flex flex-col items-center gap-1 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <span className="font-semibold text-gray-800">예</span>
              <span className="text-xs text-gray-500">원천세 신고 필요</span>
            </button>
            <button
              onClick={() => handleHasEmployeesSelect(false)}
              aria-pressed={false}
              className="flex flex-col items-center gap-1 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <span className="font-semibold text-gray-800">아니오</span>
              <span className="text-xs text-gray-500">&nbsp;</span>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 text-center">
          <p className="text-sm text-gray-600">
            사업자 유형에 맞는 세무 일정과 계산기를 제공해드릴게요.
          </p>
          <button
            onClick={handleComplete}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            시작하기
          </button>
        </div>
      )}
    </Modal>
  )
}

function stepTitle(step: 1 | 2 | 3): string {
  switch (step) {
    case 1:
      return '사업자 유형을 선택해주세요'
    case 2:
      return '직원이 있으신가요?'
    case 3:
      return '설정 완료! 맞춤형 세무 정보를 제공해드릴게요.'
  }
}
