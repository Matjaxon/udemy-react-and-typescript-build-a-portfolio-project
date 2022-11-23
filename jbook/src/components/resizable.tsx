import { useEffect, useState } from 'react';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';
import './resizable.css';

interface ResizableProps {
  direction: 'horizontal' | 'vertical';
  children?: React.ReactNode;
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
  let resizableProps: ResizableBoxProps;
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [width, setWidth] = useState(window.innerWidth * 0.75);

  // The components should be resized when the user resizes the window. When this happens
  // we need to update the state of the component so that it forces it to rerender.
  useEffect(() => {
    let timer: any;
    const listener = () => {
      // Using this timer "debounces" so that it doesn't constantly try to rerender while the user
      // is resizing the window.
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        setInnerHeight(window.innerHeight);
        setInnerWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener('resize', listener);

    // Function to clean up the listener if it stops being shown.
    return () => {
      window.removeEventListener('resize', listener);
    };
  }, []);

  // Second useEffect function that for managing the widths. It's broken out separately as to not
  // repeatedly add and remove the event listener that we only want to apply once.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.innerWidth * 0.75 < width) {
        setWidth(window.innerWidth * 0.75);
      }
    }, 100);

    // This function will be called the next time `useEffect` is invoked. It can be used to cancel the
    // previous timer before a new one is set.
    return () => {
      clearTimeout(timer);
    };
  }, [width, innerWidth]);

  if (direction === 'horizontal') {
    resizableProps = {
      className: 'resize-horizontal',
      minConstraints: [innerWidth * 0.2, Infinity],
      maxConstraints: [innerWidth * 0.75, Infinity],
      height: Infinity,
      width,
      resizeHandles: ['e'],
      onResizeStop: (_, data) => {
        setWidth(data.size.width);
      }
    };
  } else {
    resizableProps = {
      minConstraints: [Infinity, 24],
      maxConstraints: [Infinity, innerHeight * 0.9], // Ensure that the user can't expand past the bottom of the screen
      height: 300,
      width: Infinity,
      resizeHandles: ['s']
    };
  }
  return <ResizableBox {...resizableProps}>{children}</ResizableBox>;
};

export default Resizable;
