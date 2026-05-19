import { Transition, type TransitionRootProps } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";

/**
 * Stage - A utility component that handles the mounting/unmounting of elements
 * based on a condition, with built-in transition support.
 *
 * It uses Headless UI's Transition with 'unmount' set to true
 * to ensure that DOM nodes are cleaned up when not visible.
 */

interface StageProps extends Omit<TransitionRootProps, "as"> {
  show: boolean;
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}

const Stage = ({
  show,
  children,
  className,
  as: Tag = Fragment,
  ...props
}: StageProps) => {
  return (
    <Transition
      show={show}
      as={Tag}
      unmount={true} // The core of the optimization: DOM nodes are removed when hidden
      {...(Tag !== Fragment ? { className } : {})}
      enter="transition-opacity duration-150 ease-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-100 ease-in"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      {...props}
    >
      {children}
    </Transition>
  );
};

export default Stage;
