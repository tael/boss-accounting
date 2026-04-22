import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

const meta: Meta<typeof Modal> = {
  title: '공통 컴포넌트/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Modal>

export const Open: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="거래 등록">
          <p className="text-sm text-gray-600">모달 본문 내용입니다.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsOpen(false)}>확인</Button>
          </div>
        </Modal>
      </>
    )
  },
}

export const Closed: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="거래 등록">
          <p className="text-sm text-gray-600">모달 본문 내용입니다.</p>
        </Modal>
      </>
    )
  },
}

export const WithoutTitle: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <p className="text-sm text-gray-600">타이틀 없는 모달입니다.</p>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setIsOpen(false)}>닫기</Button>
          </div>
        </Modal>
      </>
    )
  },
}

export const LongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="긴 내용 스크롤">
          <div className="space-y-3">
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} className="text-sm text-gray-600">
                항목 {i + 1}: 이 줄은 모달 스크롤 테스트를 위한 긴 내용입니다.
              </p>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button onClick={() => setIsOpen(false)}>확인</Button>
          </div>
        </Modal>
      </>
    )
  },
}
