/**
 * @domain Shared / Components
 * @SSoT docs/domains/ui-ux/shell-principles.md
 */
import React, { useState, forwardRef, useEffect } from "react";
import Tippy, { type TippyProps } from "@tippyjs/react";
import HeadlessTippy from "@tippyjs/react/headless";
import type { Placement, Options as PopperOptions } from "@popperjs/core";
import type { Plugin as TippyCorePlugin } from "tippy.js";

type HeadlessAttrs = Record<string, unknown>;
type TippyPlugin = TippyCorePlugin;

interface IProps {
  children?: React.ReactNode;
  popover?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  placement?: Placement;
  animation?: boolean;
  inertia?: boolean;
  duration?: number | [number | null, number | null];
  touch?: boolean;
  interactive?: boolean;
  maxWidth?: number | string;
  delay?: number | [number | null, number | null];
  offset?: [number, number];
  arrow?: boolean;
  popperOptions?: Partial<PopperOptions>;
  renderInJsx?: boolean;
}

const LazyTippy = forwardRef<Element, TippyProps>((props, ref) => {
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const lazyPlugin: TippyPlugin = {
    fn: () => ({
      onShow: () => setMounted(true),
      onHidden: () => setMounted(false),
    }),
  };

  const headlessStatePlugin: TippyPlugin = {
    fn: (instance: { reference: Element }) => {
      const state = { open: false, hover: false };
      const applyAttributes = (reference: HTMLElement) => {
        reference.setAttribute("data-state", state.open ? "open" : "closed");
        if (state.hover) reference.setAttribute("data-hover", "");
        else reference.removeAttribute("data-hover");
      };
      return {
        onMount: () => {
          state.open = true;
          applyAttributes(instance.reference as HTMLElement);
        },
        onHide: () => {
          state.open = false;
          state.hover = false;
          applyAttributes(instance.reference as HTMLElement);
        },
        onShow: () => {
          state.open = true;
          applyAttributes(instance.reference as HTMLElement);
        },
        onTrigger: (instance: { reference: Element }, event: Event) => {
          if (event.type === "mouseenter") {
            state.hover = true;
            state.open = true;
            applyAttributes(instance.reference as HTMLElement);
          }
        },
        onUntrigger: (instance: { reference: Element }, event: Event) => {
          if (event.type === "mouseleave" && !state.open) {
            state.hover = false;
            applyAttributes(instance.reference as HTMLElement);
          }
        },
      };
    },
  };

  if (!isClient) return <>{props.children}</>;

  const computedProps = { ...props } as TippyProps;
  computedProps.plugins = [lazyPlugin, headlessStatePlugin, ...(props.plugins ?? [])];
  computedProps.content = mounted ? props.content : "";
  return <Tippy {...computedProps} ref={ref} />;
});

const LazyHeadlessTippy = forwardRef<Element, TippyProps & { render: (attrs: HeadlessAttrs) => React.ReactNode }>((props, ref) => {
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const lazyPlugin: TippyPlugin = {
    fn: () => ({
      onShow: () => setMounted(true),
      onHidden: () => setMounted(false),
    }),
  };

  const headlessStatePlugin: TippyPlugin = {
    fn: (instance: { reference: Element }) => {
      const state = { open: false, hover: false };
      const applyAttributes = (reference: HTMLElement) => {
        reference.setAttribute("data-state", state.open ? "open" : "closed");
        if (state.hover) reference.setAttribute("data-hover", "");
        else reference.removeAttribute("data-hover");
      };
      return {
        onMount: () => { applyAttributes(instance.reference as HTMLElement); state.open = true; },
        onHide: () => { state.open = false; state.hover = false; applyAttributes(instance.reference as HTMLElement); },
        onShow: () => { state.open = true; applyAttributes(instance.reference as HTMLElement); },
        onTrigger: (inst, event: Event) => { if (event.type === "mouseenter") { state.hover = true; state.open = true; applyAttributes(inst.reference as HTMLElement); } },
        onUntrigger: (inst, event: Event) => { if (event.type === "mouseleave" && !state.open) { state.hover = false; applyAttributes(inst.reference as HTMLElement); } },
      };
    },
  };

  if (!isClient) return <>{props.children}</>;

  const computedProps = { ...props } as any;
  computedProps.plugins = [lazyPlugin, headlessStatePlugin, ...(props.plugins ?? [])];
  const originalRender = props.render;
  computedProps.render = (attrs: HeadlessAttrs) => mounted ? originalRender(attrs) : null;

  return <HeadlessTippy {...computedProps} ref={ref} />;
});

const CustomPopover: React.FC<IProps> = (props) => {
  const {
    children,
    popover,
    disabled = false,
    renderInJsx = false,
    placement = "right-start",
    animation = false,
    duration = [0, 1],
    ...rest
  } = props;
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  if (disabled || !isClient) return children as React.ReactElement;

  const commonProps: any = {
    ...rest,
    placement,
    animation,
    duration,
    popperOptions: props.popperOptions || {
      modifiers: [
        { name: "flip", enabled: true, options: { fallbackPlacements: ["left-start", "top"], allowedAutoPlacements: ["right-start", "left-start", "top"] } },
        { name: "preventOverflow", enabled: true },
        { name: "eventListeners", options: { scroll: false } },
      ],
    },
    trigger: "mouseenter focus",
  };

  if (renderInJsx) {
    return (
      <LazyHeadlessTippy {...commonProps} render={(attrs: HeadlessAttrs) => (
        <div className={`tippy-box ${props.className ?? ""}`} tabIndex={-1} {...attrs}>
          <div className="tippy-content">{popover}</div>
          {props.arrow && <div className="tippy-arrow" data-popper-arrow=""><span className="tippy-arrow-inner" /></div>}
        </div>
      )}>
        {children as React.ReactElement}
      </LazyHeadlessTippy>
    );
  }

  return <LazyTippy {...commonProps} content={popover}>{children as React.ReactElement}</LazyTippy>;
};

export default CustomPopover;
