"use client"

import { useMemo, useRef, useState } from "react"
import { CalendarDays } from "lucide-react"

import { formatToDisplay, maskDdMmYyyy, parseDdMmYyyy } from "@/lib/date-format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"

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
            onChange={(e) => onChange(maskDdMmYyyy(e.target.value))}
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
        className="p-0"
        align="start"
        sideOffset={6}
        onInteractOutside={(event) => {
          // Đừng đóng popup khi click lại vào ô input/trigger
          if (triggerRef.current?.contains(event.target as Node)) {
            event.preventDefault()
          }
        }}
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
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
        <div className="flex items-center justify-between border-t px-3 pb-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
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
