import { forwardRef } from "react";
import { Search } from "lucide-react";

import { cn } from "../lib/utils";
import { Input, type InputProps } from "./input";

export type SearchInputProps = Omit<InputProps, "type"> & {
  wrapperClassName?: string;
};

// 검색 아이콘이 붙은 입력 필드. 아이콘 위치와 좌측 패딩을 한 곳에서 관리해 글자가 아이콘에 겹치지 않게 한다.
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ wrapperClassName, className, inputSize = "sm", ...props }, ref) => {
    return (
      <div className={cn("relative block", wrapperClassName)}>
        <Search
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted",
            inputSize === "sm" ? "size-3.5" : "size-4",
          )}
        />
        <Input
          ref={ref}
          type="text"
          inputSize={inputSize}
          className={cn("pl-9", className)}
          {...props}
        />
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
