"use client";

import * as React from "react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@/components/ui/bottomsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
};

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "确认操作",
  description = "确定要执行这个操作吗？",
  confirmText = "确认",
  cancelText = "取消",
  tone = "default",
}: ConfirmDialogProps) {
  function handleCancel() {
    onCancel?.();
    onOpenChange(false);
  }

  return (
    <BottomSheet open={open} onOpenChange={(next) => (!next ? handleCancel() : onOpenChange(next))}>
      <BottomSheetContent className="max-w-md" hideClose>
        <BottomSheetHeader>
          <BottomSheetTitle>{title}</BottomSheetTitle>
          {description ? <BottomSheetDescription>{description}</BottomSheetDescription> : null}
        </BottomSheetHeader>

        <BottomSheetFooter className="pt-2 sm:justify-end">
          <Button variant="outline" onClick={handleCancel} className="h-11 rounded-2xl sm:min-w-28">
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={tone === "danger" ? "destructive" : "default"}
            className="h-11 rounded-2xl sm:min-w-28"
          >
            {confirmText}
          </Button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  );
}

type ConfirmConfig = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "danger";
  onConfirm?: () => void;
  onCancel?: () => void;
};

export function useConfirm() {
  const [config, setConfig] = React.useState<ConfirmConfig | null>(null);

  const confirm = React.useCallback((options: Omit<ConfirmConfig, "open">) => {
    setConfig({
      open: true,
      title: options.title,
      description: options.description,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      tone: options.tone,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    });
  }, []);

  const confirmAsync = React.useCallback(
    (options: Omit<ConfirmConfig, "open" | "onConfirm" | "onCancel">) =>
      new Promise<boolean>((resolve) => {
        setConfig({
          open: true,
          title: options.title,
          description: options.description,
          confirmText: options.confirmText,
          cancelText: options.cancelText,
          tone: options.tone,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        });
      }),
    []
  );

  const handleClose = React.useCallback(() => setConfig(null), []);

  const handleConfirm = React.useCallback(() => {
    config?.onConfirm?.();
    handleClose();
  }, [config, handleClose]);

  const handleCancel = React.useCallback(() => {
    config?.onCancel?.();
    handleClose();
  }, [config, handleClose]);

  return {
    confirm,
    confirmAsync,
    ConfirmDialog: config ? (
      <ConfirmDialog
        open={config.open}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={config.title}
        description={config.description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        tone={config.tone}
      />
    ) : null,
  };
}

type NoticeConfig = {
  title: string;
  description?: string;
  buttonText?: string;
};

export function useNoticeDialog() {
  const [config, setConfig] = React.useState<NoticeConfig | null>(null);

  const notify = React.useCallback((options: NoticeConfig) => {
    setConfig(options);
  }, []);

  const close = React.useCallback(() => setConfig(null), []);

  return {
    notify,
    NoticeDialog: config ? (
      <BottomSheet open onOpenChange={(open) => (!open ? close() : undefined)}>
        <BottomSheetContent className="max-w-md" hideClose>
          <BottomSheetHeader>
            <BottomSheetTitle>{config.title}</BottomSheetTitle>
            {config.description ? <BottomSheetDescription>{config.description}</BottomSheetDescription> : null}
          </BottomSheetHeader>
          <BottomSheetFooter className="pt-2">
            <Button className="h-11 rounded-2xl" onClick={close}>
              {config.buttonText ?? "我知道了"}
            </Button>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    ) : null,
  };
}

type PromptConfig = {
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
};

export function usePromptDialog() {
  const [config, setConfig] = React.useState<(PromptConfig & { resolve: (value: string | null) => void }) | null>(null);
  const [value, setValue] = React.useState("");

  const prompt = React.useCallback((options: PromptConfig) => {
    return new Promise<string | null>((resolve) => {
      setValue(options.defaultValue ?? "");
      setConfig({
        ...options,
        resolve,
      });
    });
  }, []);

  const close = React.useCallback((result: string | null) => {
    setConfig((current) => {
      current?.resolve(result);
      return null;
    });
    setValue("");
  }, []);

  const isDisabled = Boolean(config?.required && value.trim().length === 0);

  return {
    prompt,
    PromptDialog: config ? (
      <BottomSheet open onOpenChange={(open) => (!open ? close(null) : undefined)}>
        <BottomSheetContent className="max-w-md" hideClose>
          <BottomSheetHeader>
            <BottomSheetTitle>{config.title}</BottomSheetTitle>
            {config.description ? <BottomSheetDescription>{config.description}</BottomSheetDescription> : null}
          </BottomSheetHeader>

          <div className="px-1 py-1">
            <Input
              value={value}
              placeholder={config.placeholder}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isDisabled) {
                  event.preventDefault();
                  close(value.trim());
                }
              }}
              className="h-11 rounded-2xl"
              autoFocus
            />
          </div>

          <BottomSheetFooter className="pt-2">
            <Button variant="outline" onClick={() => close(null)} className="h-11 rounded-2xl sm:min-w-28">
              {config.cancelText ?? "取消"}
            </Button>
            <Button
              onClick={() => close(config.required === false ? value : value.trim())}
              className="h-11 rounded-2xl sm:min-w-28"
              disabled={isDisabled}
            >
              {config.confirmText ?? "确认"}
            </Button>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheet>
    ) : null,
  };
}
