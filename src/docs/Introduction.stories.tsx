import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: '소개',
  parameters: {
    layout: 'fullscreen',
    docs: { disable: true },
    order: 0,
  },
}

export default meta
type Story = StoryObj

// 토스 색상 팔레트
const colors = {
  blue50: '#ebf3fe',
  blue100: '#c9e2fd',
  blue200: '#96c4fb',
  blue300: '#5ba6f8',
  blue400: '#3182f6',
  blue500: '#1b64da',
  blue600: '#1250b0',
  grey50: '#f9fafb',
  grey100: '#f2f4f6',
  grey200: '#e5e8eb',
  grey300: '#d1d6db',
  grey400: '#b0b8c1',
  grey500: '#8b95a1',
  grey600: '#6b7684',
  grey700: '#4e5968',
  grey800: '#333d4b',
  grey900: '#191f28',
}

const componentCategories = [
  {
    name: '공통',
    icon: '◻',
    description: '버튼, 뱃지, 카드 등 범용 UI 컴포넌트',
    count: '공통 컴포넌트',
    color: colors.blue400,
    bg: colors.blue50,
  },
  {
    name: '대시보드',
    icon: '◈',
    description: '요약 카드, KPI 지표, 홈 화면 위젯',
    count: '대시보드 컴포넌트',
    color: '#00b288',
    bg: '#e6faf5',
  },
  {
    name: '거래',
    icon: '◑',
    description: '거래 내역 목록, 필터, 상세 뷰',
    count: '거래 컴포넌트',
    color: '#f04452',
    bg: '#fff0f1',
  },
  {
    name: '분석',
    icon: '◐',
    description: '차트, 그래프, 트렌드 시각화',
    count: '분석 컴포넌트',
    color: '#7b61ff',
    bg: '#f3f0ff',
  },
  {
    name: '재무',
    icon: '◷',
    description: '재무제표, 손익계산서, 잔액 뷰',
    count: '재무 컴포넌트',
    color: '#f79e1b',
    bg: '#fff8eb',
  },
  {
    name: '세금',
    icon: '◆',
    description: '세금 계산, 부가세, 신고 안내',
    count: '세금 컴포넌트',
    color: '#3182f6',
    bg: '#ebf3fe',
  },
]

const techStack = [
  { label: 'React 19', color: colors.blue400 },
  { label: 'TypeScript', color: '#3178c6' },
  { label: 'Zustand', color: '#433e38' },
  { label: 'Recharts', color: '#22a45d' },
  { label: 'Storybook 10', color: '#ff4785' },
  { label: 'Vite', color: '#646cff' },
]

const blueScale = [
  { name: 'blue50', hex: colors.blue50 },
  { name: 'blue100', hex: colors.blue100 },
  { name: 'blue200', hex: colors.blue200 },
  { name: 'blue300', hex: colors.blue300 },
  { name: 'blue400', hex: colors.blue400 },
  { name: 'blue500', hex: colors.blue500 },
  { name: 'blue600', hex: colors.blue600 },
]

const greyScale = [
  { name: 'grey50', hex: colors.grey50 },
  { name: 'grey100', hex: colors.grey100 },
  { name: 'grey200', hex: colors.grey200 },
  { name: 'grey300', hex: colors.grey300 },
  { name: 'grey400', hex: colors.grey400 },
  { name: 'grey500', hex: colors.grey500 },
  { name: 'grey600', hex: colors.grey600 },
  { name: 'grey700', hex: colors.grey700 },
  { name: 'grey800', hex: colors.grey800 },
  { name: 'grey900', hex: colors.grey900 },
]

const principles = [
  { icon: '✦', title: 'Simple', desc: '복잡한 금융을 단순하게. 군더더기 없는 UI.' },
  { icon: '◎', title: 'Clear', desc: '숫자와 데이터를 명확하게. 정보 위계 최우선.' },
  { icon: '→', title: 'Direct', desc: '사용자가 원하는 것을 바로. 최소 클릭.' },
]

function IntroductionPage() {
  const [copied, setCopied] = React.useState<string | null>(null)

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopied(hex)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif',
        backgroundColor: colors.grey100,
        minHeight: '100vh',
        margin: 0,
        padding: 0,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          background: `linear-gradient(135deg, #1250b0 0%, ${colors.blue400} 60%, #5ba6f8 100%)`,
          padding: '64px 48px 56px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
              letterSpacing: '0.02em',
            }}
          >
            <span>◈</span>
            <span>사장님 회계 Design System</span>
          </div>
          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              margin: '0 0 16px',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            사장님 회계
          </h1>
          <p
            style={{
              fontSize: 18,
              fontWeight: 400,
              margin: '0 0 32px',
              opacity: 0.85,
              lineHeight: 1.6,
              maxWidth: 520,
            }}
          >
            소상공인·자영업자를 위한 회계 플랫폼의 디자인 시스템.
            토스 미니멀 스타일로 구축된 컴포넌트 라이브러리입니다.
          </p>
          {/* 기술 스택 뱃지 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {techStack.map((tech) => (
              <span
                key={tech.label}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {tech.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* 디자인 원칙 */}
        <section style={{ marginBottom: 56 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {principles.map((p) => (
              <div
                key={p.title}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: '28px 24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  border: `1px solid ${colors.grey200}`,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.grey900, marginBottom: 8 }}>
                  {p.title}
                </div>
                <p style={{ fontSize: 14, color: colors.grey600, margin: 0, lineHeight: 1.6 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 컴포넌트 카테고리 */}
        <section style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: colors.grey900,
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}
          >
            컴포넌트 카테고리
          </h2>
          <p style={{ fontSize: 14, color: colors.grey600, margin: '0 0 24px' }}>
            왼쪽 사이드바에서 각 카테고리를 선택해 컴포넌트를 탐색하세요.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {componentCategories.map((cat) => (
              <div
                key={cat.name}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: '24px',
                  border: `1px solid ${colors.grey200}`,
                  transition: 'box-shadow 0.15s',
                  cursor: 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: cat.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      color: cat.color,
                    }}
                  >
                    {cat.icon}
                  </div>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: colors.grey900,
                    }}
                  >
                    {cat.name}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: colors.grey600,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 색상 팔레트 */}
        <section style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: colors.grey900,
              margin: '0 0 6px',
              letterSpacing: '-0.01em',
            }}
          >
            색상 팔레트
          </h2>
          <p style={{ fontSize: 14, color: colors.grey600, margin: '0 0 24px' }}>
            토스 디자인 시스템의 Blue · Grey 스케일을 기반으로 합니다.
          </p>

          {/* Blue Scale */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: '24px',
              border: `1px solid ${colors.grey200}`,
              marginBottom: 16,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.grey500,
                margin: '0 0 16px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Blue
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {blueScale.map((swatch) => (
                <div key={swatch.name} style={{ textAlign: 'center', flex: '1 1 80px', minWidth: 64 }}>
                  <div
                    onClick={() => copyColor(swatch.hex)}
                    style={{
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: swatch.hex,
                      border: `1px solid ${colors.grey200}`,
                      marginBottom: 6,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {copied === swatch.hex && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: 600,
                      }}>
                        복사됨!
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: colors.grey700 }}>
                    {swatch.name}
                  </div>
                  <div style={{ fontSize: 10, color: colors.grey500, marginTop: 2 }}>
                    {swatch.hex}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grey Scale */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: '24px',
              border: `1px solid ${colors.grey200}`,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.grey500,
                margin: '0 0 16px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Grey
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {greyScale.map((swatch) => (
                <div key={swatch.name} style={{ textAlign: 'center', flex: '1 1 72px', minWidth: 56 }}>
                  <div
                    onClick={() => copyColor(swatch.hex)}
                    style={{
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: swatch.hex,
                      border: `1px solid ${colors.grey200}`,
                      marginBottom: 6,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {copied === swatch.hex && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px', color: '#fff', fontSize: '11px', fontWeight: 600,
                      }}>
                        복사됨!
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: colors.grey700 }}>
                    {swatch.name}
                  </div>
                  <div style={{ fontSize: 10, color: colors.grey500, marginTop: 2 }}>
                    {swatch.hex}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MCP 연결 안내 */}
        <section>
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: '28px 28px',
              border: `1px solid ${colors.blue100}`,
              background: `linear-gradient(135deg, ${colors.blue50} 0%, #fff 100%)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: colors.blue400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                ◎
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: colors.grey900,
                    margin: '0 0 8px',
                  }}
                >
                  MCP 연결 안내
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: colors.grey700,
                    margin: '0 0 16px',
                    lineHeight: 1.7,
                  }}
                >
                  이 프로젝트는 Claude MCP(Model Context Protocol)와 연동되어,
                  AI가 컴포넌트 구조와 코드베이스를 직접 탐색할 수 있습니다.
                  Storybook 미리보기와 실제 앱 로직이 동기화됩니다.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['claude-code', 'storybook-mcp', 'filesystem'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: colors.blue100,
                        color: colors.blue500,
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 푸터 */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: `1px solid ${colors.grey200}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13, color: colors.grey500 }}>
            사장님 회계 Design System
          </span>
          <span style={{ fontSize: 13, color: colors.grey400 }}>
            React 19 · TypeScript · Storybook 10
          </span>
        </div>
      </div>
    </div>
  )
}

export const 소개: Story = {
  render: () => <IntroductionPage />,
}
