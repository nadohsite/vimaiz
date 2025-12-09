import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"

export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} variant="default" {...props} />
))
PrimaryButton.displayName = "PrimaryButton"

export const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} variant="secondary" {...props} />
))
SecondaryButton.displayName = "SecondaryButton"

export const DestructiveButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} variant="destructive" {...props} />
))
DestructiveButton.displayName = "DestructiveButton"

export const OutlineButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} variant="outline" {...props} />
))
OutlineButton.displayName = "OutlineButton"

export const GhostButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} variant="ghost" {...props} />
))
GhostButton.displayName = "GhostButton"
