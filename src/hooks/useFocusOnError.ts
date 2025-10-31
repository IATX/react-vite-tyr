import { useEffect, useRef, type RefObject } from 'react';

type FocusableElement = HTMLElement & {
  focus: () => void;
  click: () => void;
};

type FormFieldRefs = {
  [key: string]: RefObject<FocusableElement | null>;
};

/**
 * 自动将焦点设置到第一个包含错误的表单项。
 * 如果是 Select 组件，则同时自动打开选择列表。
 * @param errors 包含表单错误的键值对对象。
 */
export const useFocusOnError = (errors: Record<string, any>) => {
  const formFieldRefs = useRef<FormFieldRefs>({});

  const registerRef = (name: string) => {
    const ref = useRef<FocusableElement>(null);
    formFieldRefs.current[name] = ref;
    return ref;
  };

  useEffect(() => {
    const firstErrorKey = Object.keys(errors).find(key => errors[key]);

    if (firstErrorKey) {
      const element = formFieldRefs.current[firstErrorKey]?.current;
      
      if (element && typeof element.focus === 'function') {
        element.focus();

        // 关键改动：使用更可靠的判断
        // 检查元素是否为 MUI Select 的 input
        // 1. 检查 tagName 是否为 'DIV'
        // 2. 检查 classList 是否包含 'MuiSelect-select'
        // if (element.nodeName === 'DIV' && element.classList.contains('MuiSelect-select')) {
          // element.click();
        // }
      }
    }
  }, [errors]);

  return { registerRef };
};