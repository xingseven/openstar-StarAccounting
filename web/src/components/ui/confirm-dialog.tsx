"use client"

import * as React from "react"
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetFooter
} from "@/components/ui/bottomsheet"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel?: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "确认操作",
  description = "确定要执行此操作吗？",
  confirmText = "确认",
  cancelText = "取消",
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <BottomSheet open={open} onOpenChange={handleCancel}>
      <BottomSheetContent className="rounded-t-2xl" hideClose>
        <BottomSheetHeader>
          <BottomSheetTitle className="text-center">{title}</BottomSheetTitle>
        </BottomSheetHeader>
        <p className="text-center text-sm text-gray-500 py-4">{description}</p>
        <BottomSheetFooter className="flex-row justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-11"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-11 bg-red-500 hover:bg-red-600"
          >
            {confirmText}
          </Button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}

// 包装函数，用于替换原生 confirm
export function useConfirm() {
  const [config, setConfig] = React.useState<{
    open: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
  } | null>(null)

  const confirm = (options: {
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
  }) => {
    setConfig({
      open: true,
      title: options.title || "确认操作",
      description: options.description || "确定要执行此操作吗？",
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    })
  }

  const handleClose = () => {
    setConfig(null)
  }

  const handleConfirm = () => {
    config?.onConfirm()
    handleClose()
  }

  const handleCancel = () => {
    config?.onCancel?.()
    handleClose()
  }

  return {
    confirm,
    ConfirmDialog: config ? (
      <ConfirmDialog
        open={config.open}
        onOpenChange={(open) => !open && handleClose()}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={config.title}
        description={config.description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
      />
    ) : null,
  }
}
