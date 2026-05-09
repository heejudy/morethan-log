"use client"

import styled from "@emotion/styled"
import { useState } from "react"
import { AiOutlineLoading, AiOutlineLoading3Quarters } from "react-icons/ai"

export default function AdminDeployPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [password, setPassword] = useState<string>("")

  const startDeploy = async () => {
    if (loading) return
    setLoading(true)
    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        alert("비밀번호가 올바르지 않습니다.")
        return
      }

      alert("배포 시작 🚀")
      setIsOpen(false)
      setPassword("")
    } finally {
      setLoading(false)
    }
  }

  const onClick = () => {
    if (loading) return
    setIsOpen(true)
  }

  return (
    <StyledWrapper>
      <DeployButton onClick={onClick}>Update</DeployButton>

      {isOpen && (
        <ModalOverlay>
          <Modal>
            <ModalTitle>비밀번호 입력</ModalTitle>
            <PasswordInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") startDeploy()
              }}
              placeholder="비밀번호"
              autoFocus
            />
            <ModalActions>
              <CancelButton
                onClick={() => {
                  setIsOpen(false)
                  setPassword("")
                }}
              >
                취소
              </CancelButton>
              <ConfirmButton onClick={startDeploy} disabled={loading}>
                {loading ? <AiOutlineLoading3Quarters /> : "확인"}
              </ConfirmButton>
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  padding: 40px;
`

const DeployButton = styled.button`
  background-color: gray;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`

const Modal = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 320px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
`

const ModalTitle = styled.div`
  margin-bottom: 12px;
  font-weight: 600;
`

const PasswordInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 16px;
`

const ModalActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`

const CancelButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
`

const ConfirmButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  background: #f6a4b4;
  color: white;
`
