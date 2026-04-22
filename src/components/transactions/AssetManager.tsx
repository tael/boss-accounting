/**
 * 사업용 고정자산 관리 컴포넌트
 * - 자산 등록, 목록, 활성/비활성 토글, 삭제
 * - 국세청 기준 내용연수 프리셋 또는 직접 입력
 * - 즉시 감가상각 적용 버튼 (이번 달 미적용분 수동 트리거)
 */

import { useState } from 'react'
import { useAssetStore } from '@/stores/assetStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { formatKRW, formatKRWNoSymbol, parseKRW, getTodayLocal } from '@/utils/format'
import { ASSET_TYPE_PRESETS } from '@/constants/assetTypes'
import type { FixedAsset, FixedAssetInput } from '@/types/fixedAsset'

/** 기본 감가상각비 카테고리 ID */
const DEFAULT_DEPRECIATION_CATEGORY_ID = 'expense-depreciation'

/** 내용연수 입력 모드: 프리셋 선택 또는 직접 입력 */
const CUSTOM_PRESET_KEY = '__custom__'

interface FormErrors {
  name?: string
  purchaseDate?: string
  purchaseCostKRW?: string
  usefulLifeYears?: string
  residualValueKRW?: string
}

function validateInput(input: Partial<FixedAssetInput>): FormErrors {
  const errors: FormErrors = {}
  if (!input.name || input.name.trim().length === 0) {
    errors.name = '자산명을 입력하세요'
  }
  if (!input.purchaseDate) {
    errors.purchaseDate = '취득일을 선택하세요'
  }
  if (
    input.purchaseCostKRW === undefined ||
    !Number.isFinite(input.purchaseCostKRW) ||
    input.purchaseCostKRW <= 0
  ) {
    errors.purchaseCostKRW = '0보다 큰 취득가를 입력하세요'
  }
  if (
    input.usefulLifeYears === undefined ||
    !Number.isFinite(input.usefulLifeYears) ||
    input.usefulLifeYears <= 0 ||
    input.usefulLifeYears > 50
  ) {
    errors.usefulLifeYears = '1-50 사이의 내용연수를 입력하세요'
  }
  if (
    input.residualValueKRW === undefined ||
    !Number.isFinite(input.residualValueKRW) ||
    input.residualValueKRW < 0
  ) {
    errors.residualValueKRW = '0 이상의 잔존가치를 입력하세요'
  } else if (
    input.purchaseCostKRW !== undefined &&
    input.residualValueKRW >= input.purchaseCostKRW
  ) {
    errors.residualValueKRW = '잔존가치는 취득가보다 작아야 합니다'
  }
  return errors
}

export default function AssetManager() {
  const { assets, addAsset, updateAsset, deleteAsset, applyMonthlyDepreciation } =
    useAssetStore()
  const addTransaction = useTransactionStore((s) => s.addTransaction)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(getTodayLocal())
  const [costRaw, setCostRaw] = useState('')
  const [residualRaw, setResidualRaw] = useState('')
  const [presetKey, setPresetKey] = useState<string>(ASSET_TYPE_PRESETS[0]!.name)
  const [customYears, setCustomYears] = useState<number>(5)
  const [errors, setErrors] = useState<FormErrors>({})
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [applyMessage, setApplyMessage] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setPurchaseDate(getTodayLocal())
    setCostRaw('')
    setResidualRaw('')
    setPresetKey(ASSET_TYPE_PRESETS[0]!.name)
    setCustomYears(5)
    setErrors({})
  }

  const resolveYears = (): number => {
    if (presetKey === CUSTOM_PRESET_KEY) return customYears
    const preset = ASSET_TYPE_PRESETS.find((p) => p.name === presetKey)
    return preset?.years ?? customYears
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cost = costRaw === '' ? undefined : Number(costRaw)
    const residual = residualRaw === '' ? 0 : Number(residualRaw)
    const years = resolveYears()

    const input: FixedAssetInput = {
      name: name.trim(),
      purchaseDate,
      purchaseCostKRW: cost as number,
      usefulLifeYears: years,
      residualValueKRW: residual,
      depreciationCategoryId: DEFAULT_DEPRECIATION_CATEGORY_ID,
      enabled: true,
    }

    const validationErrors = validateInput(input)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    addAsset(input)
    resetForm()
    setShowForm(false)
  }

  const handleToggleEnabled = (asset: FixedAsset) => {
    updateAsset(asset.id, { enabled: !asset.enabled })
  }

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    deleteAsset(id)
    setConfirmDeleteId(null)
  }

  const handleApplyNow = () => {
    const count = applyMonthlyDepreciation(addTransaction)
    if (count === 0) {
      setApplyMessage('이번 달 이미 모두 적용되었거나 적용 대상 자산이 없습니다.')
    } else {
      setApplyMessage(`${count}건의 감가상각비를 이번 달 거래로 등록했습니다.`)
    }
    setTimeout(() => setApplyMessage(null), 4000)
  }

  // 실시간 월 상각액 미리보기
  const previewMonthly = (() => {
    const cost = costRaw === '' ? 0 : Number(costRaw)
    const residual = residualRaw === '' ? 0 : Number(residualRaw)
    const years = resolveYears()
    if (!Number.isFinite(cost) || cost <= 0 || years <= 0) return 0
    const base = cost - residual
    if (base <= 0) return 0
    return Math.round(base / (years * 12))
  })()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">사업용 자산 감가상각</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            국세청 기준 내용연수로 월별 감가상각비를 자동 계상합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyNow}
            disabled={assets.length === 0}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            이번 달 즉시 적용
          </button>
          <button
            type="button"
            onClick={() => {
              if (showForm) resetForm()
              setShowForm((v) => !v)
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            {showForm ? '취소' : '자산 추가'}
          </button>
        </div>
      </div>

      {applyMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          {applyMessage}
        </div>
      )}

      {/* 추가 폼 */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-3"
        >
          {/* 자산명 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              자산명
            </label>
            <input
              type="text"
              placeholder="예: 사무용 노트북"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              className={[
                'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.name ? 'border-red-400' : 'border-gray-300',
              ].join(' ')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* 취득일 + 취득가 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                취득일
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.purchaseDate ? 'border-red-400' : 'border-gray-300',
                ].join(' ')}
              />
              {errors.purchaseDate && (
                <p className="mt-1 text-xs text-red-500">{errors.purchaseDate}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                취득가 (원)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={costRaw === '' ? '' : formatKRWNoSymbol(Number(costRaw) || 0)}
                onChange={(e) => {
                  const raw = parseKRW(e.target.value)
                  setCostRaw(Number.isNaN(raw) ? '' : String(raw))
                }}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.purchaseCostKRW ? 'border-red-400' : 'border-gray-300',
                ].join(' ')}
              />
              {errors.purchaseCostKRW && (
                <p className="mt-1 text-xs text-red-500">{errors.purchaseCostKRW}</p>
              )}
            </div>
          </div>

          {/* 자산 구분 (내용연수 프리셋) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              자산 구분 (국세청 기준 내용연수)
            </label>
            <select
              value={presetKey}
              onChange={(e) => setPresetKey(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ASSET_TYPE_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.years}년)
                </option>
              ))}
              <option value={CUSTOM_PRESET_KEY}>직접 입력</option>
            </select>
          </div>

          {/* 내용연수 직접 입력 + 잔존가치 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                내용연수 (년)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                step={1}
                disabled={presetKey !== CUSTOM_PRESET_KEY}
                value={
                  presetKey === CUSTOM_PRESET_KEY
                    ? customYears
                    : (ASSET_TYPE_PRESETS.find((p) => p.name === presetKey)?.years ?? 0)
                }
                onChange={(e) => setCustomYears(Number(e.target.value))}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'disabled:bg-gray-100 disabled:cursor-not-allowed',
                  errors.usefulLifeYears ? 'border-red-400' : 'border-gray-300',
                ].join(' ')}
              />
              {errors.usefulLifeYears && (
                <p className="mt-1 text-xs text-red-500">{errors.usefulLifeYears}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                잔존가치 (원, 기본 0)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={
                  residualRaw === ''
                    ? ''
                    : formatKRWNoSymbol(Number(residualRaw) || 0)
                }
                onChange={(e) => {
                  const raw = parseKRW(e.target.value)
                  setResidualRaw(Number.isNaN(raw) ? '' : String(raw))
                }}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.residualValueKRW ? 'border-red-400' : 'border-gray-300',
                ].join(' ')}
              />
              {errors.residualValueKRW && (
                <p className="mt-1 text-xs text-red-500">{errors.residualValueKRW}</p>
              )}
            </div>
          </div>

          {/* 월 상각액 미리보기 */}
          <div className="rounded-lg bg-white border border-blue-200 px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-gray-600">월 감가상각액 (정액법)</span>
            <span className="text-sm font-semibold text-blue-700">
              {formatKRW(previewMonthly)}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              자산 저장
            </button>
          </div>
        </form>
      )}

      {/* 목록 */}
      {assets.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          등록된 사업용 자산이 없습니다.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {asset.name}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                    {asset.usefulLifeYears}년
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>취득 {asset.purchaseDate}</span>
                  <span>취득가 {formatKRW(asset.purchaseCostKRW)}</span>
                  {asset.residualValueKRW > 0 && (
                    <span>잔여 {formatKRW(asset.residualValueKRW)}</span>
                  )}
                </div>
                {asset.lastAppliedMonth && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    마지막 적용: {asset.lastAppliedMonth}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-gray-500">월 상각액</p>
                  <p className="text-sm font-semibold text-red-500">
                    -{formatKRW(asset.monthlyDepreciationKRW)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleEnabled(asset)}
                  aria-pressed={asset.enabled}
                  title={asset.enabled ? '활성 (클릭시 비활성화)' : '비활성 (클릭시 활성화)'}
                  className={[
                    'text-xs px-2 py-1 rounded-md border transition-colors',
                    asset.enabled
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100',
                  ].join(' ')}
                >
                  {asset.enabled ? '활성' : '비활성'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(asset.id)}
                  onBlur={() => setConfirmDeleteId(null)}
                  className={[
                    'text-xs px-2 py-1 rounded-md border transition-colors',
                    confirmDeleteId === asset.id
                      ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                      : 'border-red-200 text-red-500 hover:bg-red-50',
                  ].join(' ')}
                >
                  {confirmDeleteId === asset.id ? '한 번 더' : '삭제'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
