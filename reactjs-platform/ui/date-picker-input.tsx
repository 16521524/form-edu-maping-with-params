"use client"

import { useMemo, useRef, useState } from "react"
import { format, isValid, parse } from "date-fns"
import { CalendarDays } from "lucide-react"

import { cn } from '../utilities/utils/common.util'
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Input } from "./input"
import { Popover, PopoverAnchor, PopoverContent } from "./popover"

const DISPLAY_DATE_FORMAT = "dd/MM/yyyy"

const parseDdMmYyyy = (value?: string) => {
  if (!value) return null
  const parsed = parse(value, DISPLAY_DATE_FORMAT, new Date())
  return isValid(parsed) ? parsed : null
}

const formatToDisplay = (date?: Date | null) => {
  return date ? format(date, DISPLAY_DATE_FORMAT) : ""
}

type DatePickerInputProps = {
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  inputClassName?: string
  id?: string
  name?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DatePickerInput({
  value,
  onChange,
  onBlur,
  placeholder = "dd/mm/yyyy",
  className,
  inputClassName,
  id,
  name,
  disabled,
  minDate,
  maxDate,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement | null>(null)

  const selectedDate = useMemo(() => parseDdMmYyyy(value), [value])

  const handleSelect = (date?: Date) => {
    if (!date) return
    onChange(formatToDisplay(date))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={triggerRef} className={cn("relative", className)}>
          <Input
            id={id}
            name={name}
            value={value || ""}
            readOnly
            aria-readonly="true"
            onChange={() => {
              /* typing is blocked; value only changes via calendar */
            }}
            onKeyDown={(e) => {
              // Chặn nhập tay các phím ký tự/số nhưng vẫn cho tab/thoát
              const isCharKey = e.key.length === 1
              const blockedKeys = ["Backspace", "Delete"]
              if (isCharKey || blockedKeys.includes(e.key)) {
                e.preventDefault()
              }
            }}
            onBlur={onBlur}
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            inputMode="numeric"
            maxLength={10}
            disabled={disabled}
            className={cn("pr-11 cursor-pointer", inputClassName)}
          />
          <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="p-0 w-auto min-w-[200px]"
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={12}
        onInteractOutside={(event) => {
          // Đừng đóng popup khi click lại vào ô input/trigger
          if (triggerRef.current?.contains(event.target as Node)) {
            event.preventDefault()
          }
        }}
      >
        <Calendar
          className="p-2 pt-3 text-[10px] [--cell-size:22px]"
          mode="single"
          captionLayout="dropdown"
          hideWeekdays
          fromYear={1930}
          toYear={new Date().getFullYear()}
          selected={selectedDate || undefined}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
        />
        <div className="flex items-center justify-between border-t px-2 pb-2 pt-1 text-[10px]">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="h-7 px-2 text-[10px] font-medium"
            onClick={() => {
              onChange("")
              setOpen(false)
            }}
          >
            Xóa
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="h-7 px-2 text-[10px] font-medium"
            onClick={() => {
              const today = new Date()
              onChange(formatToDisplay(today))
              setOpen(false)
            }}
          >
            Hôm nay
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
