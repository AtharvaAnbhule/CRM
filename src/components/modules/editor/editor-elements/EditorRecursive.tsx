import React from "react";

import EditorText from "./EditorText";
import EditorContainer from "./EditorContainer";
import EditorVideo from "./EditorVideo";
import EditorLink from "./EditorLink";
import EditorContact from "./EditorContact";
import EditorPayment from "./EditorPayment";
import EditorImage from "./EditorImage";

import type { EditorElement } from "@/lib/types/editor";
import EditorSection from "./EditorSection";
import EditorCircle from "./EditorCircle";
import EditorRectangle from "./EditorRectangle";
import EditorEllipse from "./EditorEllipse";
import EditorArrow from "./EditorArrow";
import EditorGraph from "./EditorGraph";

type Props = {
  element: EditorElement;
};

const EditorRecursive = ({ element }: Props) => {
  switch (element.type) {
    case "text":
      return <EditorText element={element} />;
    case "image":
      return <EditorImage element={element} />;
    case "container":
      return <EditorContainer element={element} />;
    case "__body":
      return <EditorContainer element={element} />;
    case "2Col":
      return <EditorContainer element={element} />;
    case "3Col":
      return <EditorContainer element={element} />;
    case "section":
      return <EditorSection element={element} />;
    case "video":
      return <EditorVideo element={element} />;
    case "link":
      return <EditorLink element={element} />;
    case "contactForm":
      return <EditorContact element={element} />;
    case "circle":
      return <EditorCircle element={element}/>  ; 
    case "BarGraph":
      return <EditorGraph element={element}/>  ; 
    case "arrow":
      return <EditorArrow element={element}/>  ; 
    case "ellipse":
      return <EditorEllipse element={element}/>  ; 
    case "rectangle":
      return <EditorRectangle element={element}/>  ; 
    case "paymentForm":
      return <EditorPayment element={element} />;
    default:
      return null;
  }
};

export default EditorRecursive;
