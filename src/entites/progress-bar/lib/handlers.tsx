import { IFragment } from "@/widget/video-tag/model/video-tag.interface";
import { JSX, RefObject, useMemo } from "react"
import styles from '../ui/styles.module.scss'

    // Упрощенные хендлеры для мыши
export const handleMouseOver = (e: React.MouseEvent, isDragging: boolean, duration: number, progressContainerRef: RefObject<HTMLDivElement | null>, setHoverTime: (newHoverTime: number) => void) => {
    if (!isDragging && progressContainerRef.current && duration) {
        const rect = progressContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const newTime = (clickPosition / rect.width) * duration;
        setHoverTime(newTime);
    }
};

export const handleClick = (e: React.MouseEvent, isDragging: boolean, duration: number, progressContainerRef: RefObject<HTMLDivElement | null>, videoRef: RefObject<HTMLMediaElement>, setCurrentVideoTime: (newCurrentVideoTime: number) => void) => {
    if (!isDragging && progressContainerRef.current && duration) {
        const rect = progressContainerRef.current.getBoundingClientRect();
        const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const newTime = (clickPosition / rect.width) * duration;
        
        videoRef.current!.currentTime = newTime;
        setCurrentVideoTime(newTime);
    }
};

export const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>, 
    setIsDragging: any, 
) => {
    console.log('handleMouseDown');
    e.preventDefault();
    setIsDragging(true);
};

export interface ProgressBarFragmentProps {
  duration: number;
  fragments: IFragment[] | null | undefined;
  bufferedFragments: Array<{ start: number; end: number }>;
  currentVideoTime: number;
}

export const getProgressBarFragments = ({
  duration,
  fragments,
  bufferedFragments,
  currentVideoTime,
}: ProgressBarFragmentProps) => {
    const elements: JSX.Element[] = [];

    // Общая логика прогресса и буфера
    const getGradientStops = (
      start: number,
      end: number,
      progress: number,
      buffers: Array<{ start: number; end: number }>
    ): string[] => {
      const gradientStops: string[] = [];

      const progressPercent = progress >= end
        ? 100
        : progress > start
          ? ((progress - start) / (end - start)) * 100
          : 0;

      if (progressPercent > 0) {
        gradientStops.push("#1e90ff 0%");
        gradientStops.push(`#1e90ff ${progressPercent}%`);
        gradientStops.push(`#444 ${progressPercent}%`);
      } else {
        gradientStops.push("#444 0%");
      }

      const bufferStops: Array<{ start: number; end: number }> = [];

      buffers.forEach(buffered => {
        const overlapStart = Math.max(start, buffered.start);
        const overlapEnd = Math.min(end, buffered.end);

        if (overlapStart < overlapEnd) {
          const bufferStartPercent =
            ((overlapStart - start) / (end - start)) * 100;
          const bufferEndPercent =
            ((overlapEnd - start) / (end - start)) * 100;

          if (bufferEndPercent > progressPercent) {
            bufferStops.push({
              start: Math.max(bufferStartPercent, progressPercent),
              end: bufferEndPercent,
            });
          }
        }
      });

      bufferStops.forEach(buffer => {
        gradientStops.push(`#666 ${buffer.start}%`);
        gradientStops.push(`#666 ${buffer.end}%`);
      });

      const lastValue = gradientStops.length > 0
        ? parseFloat(gradientStops[gradientStops.length - 1].split(" ")[1].replace("%", ""))
        : 0;

      if (lastValue < 100) {
        gradientStops.push(`#444 ${Math.max(lastValue, progressPercent)}%`);
        gradientStops.push(`#444 100%`);
      }

      return gradientStops;
    };

    // Если нет фрагментов — одна сплошная полоса
    if (!duration || !fragments || fragments.length === 0) {
      const gradientStops = getGradientStops(
        0,
        duration || 100,
        currentVideoTime,
        bufferedFragments
      );

      const gradient = `linear-gradient(to right, ${gradientStops.join(", ")})`;

      elements.push(
        <div
          key="single-fragment"
          className={styles.fragment}
          style={{
            left: "0%",
            width: "100%",
            background: gradient,
          }}
        />
      );

      return elements;
    }

    // Если фрагменты есть — рисуем каждый фрагмент
    fragments.forEach((fragment, index) => {
      const fragmentStartPercent = (fragment.start / duration) * 100;
      const fragmentEndPercent = (fragment.end / duration) * 100;
      const fragmentWidthPercent = fragmentEndPercent - fragmentStartPercent;

      const gradientStops = getGradientStops(
        fragment.start,
        fragment.end,
        currentVideoTime,
        bufferedFragments
      );

      const gradient = `linear-gradient(to right, ${gradientStops.join(", ")})`;

      elements.push(
        <div
          key={index}
          className={styles.fragment}
          style={{
            left: `${fragmentStartPercent}%`,
            width: `${fragmentWidthPercent}%`,
            background: gradient,
          }}
        />
      );
    });

    return elements;
};
