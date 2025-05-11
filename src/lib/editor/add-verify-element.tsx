import { v4 as uuidv4 } from "uuid";
import { defaultStyles } from "@/config/editor";
import { EditorAction, EditorBtns, EditorElement } from "../types/editor";
import EditorCircle from "@/components/modules/editor/editor-elements/EditorCircle";

export const addVerifyElement = (
  componentType: EditorBtns,
  id: string,
  dispatch: (value: EditorAction) => void
) => {
  switch (componentType) {
    case "text": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              innerText: "Text Element",
            },
            id: uuidv4(),
            name: "Text",
            type: "text",
            styles: {
              color: "black",
              ...defaultStyles,
            },
          },
        },
      });

      break;
    } 

    case "image": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              src: "https://cdn.pixabay.com/photo/2016/05/05/02/37/sunset-1373171_1280.jpg",
              alt: "Image description",
            },
            id: uuidv4(),
            name: "Image",
            type: "image",
            styles: {
              color: "black",
              width: "1000px",
              height: "600px",
              aspectRatio: "1/1",
              marginLeft: "auto",
              marginRight: "auto",
              ...defaultStyles,
            },
          },
        },
      });

      break;
    }
    case "section": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
            ],
            id: uuidv4(),
            name: "Section",
            type: "section",
            styles: {
              ...defaultStyles,
            },
          },
        },
      });

      break;
    }
    case "container": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [],
            id: uuidv4(),
            name: "Container",
            type: "container",
            styles: {
              ...defaultStyles,
            },
          },
        },
      });

      break;
    }
    case "link": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              innerText: "Link Element",
              href: "#",
            },
            id: uuidv4(),
            name: "Link",
            styles: {
              color: "black",
              ...defaultStyles,
            },
            type: "link",
          },
        },
      });

      break;
    }
    case "video": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              src: "No Content ",
            },
            id: uuidv4(),
            name: "Video",
            styles: {},
            type: "video",
          },
        },
      });

      break;
    } 


    case "circle": {
      const mouseEvent = window.event as MouseEvent; // Get the last mouse event globally
      const x = mouseEvent?.clientX || 100; // Default to 100 if undefined
      const y = mouseEvent?.clientY || 100;
    
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            id: uuidv4(),
            name: "Circle",
            type: "circle",
            content: [ ],
            styles: {
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "2px solid black",
              backgroundColor: "transparent",
              position: "absolute",
              left: `${x - 40}px`, // Centered at click position
              top: `${y - 40}px`,
            },
          },
        },
      });
      break;
    } 


    case "BarGraph": {
      const mouseEvent = window.event as MouseEvent;
      const x = mouseEvent?.clientX || 100;
      const y = mouseEvent?.clientY || 100;
    
      const numBars = 5; // Default number of bars
      const barWidth = 30;
      const barSpacing = 10;
      const graphWidth = numBars * (barWidth + barSpacing);
      const graphHeight = 150;
    
      // Ensure each bar follows the EditorElement structure
      const bars: EditorElement[] = Array.from({ length: numBars }, (_, index) => ({
        id: uuidv4(),
        name: `Bar ${index + 1}`,
        type: "rectangle", // Type should match other shape types
        content: [],
        styles: {
          width: `${barWidth}px`,
          height: `${Math.random() * 100 + 50}px`, // Random height
          backgroundColor: "blue",
          position: "absolute",
          left: `${index * (barWidth + barSpacing)}px`,
          bottom: "0px", // Align bars to bottom
        },
      }));
    
      // Insert the bar graph container
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            id: uuidv4(),
            name: "Bar Graph",
            type: "BarGraph",
            content: bars, // Ensuring correct type
            styles: {
              width: `${graphWidth}px`,
              height: `${graphHeight}px`,
              position: "absolute",
              left: `${x - graphWidth / 2}px`,
              top: `${y - graphHeight / 2}px`,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              border: "1px solid black",
              padding: "10px",
              backgroundColor: "transparent",
            },
          },
        },
      });
    
      break;
    }
    
    
    
    

    case "ellipse": {
      const mouseEvent = window.event as MouseEvent; // Get the last mouse event globally
      const x = mouseEvent?.clientX || 100; // Default to 100 if undefined
      const y = mouseEvent?.clientY || 100;
    
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            id: uuidv4(),
            name: "Ellipse",
            type: "ellipse",
            content: [],
            styles: {
              width: "120px",  // Wider for an ellipse
              height: "80px",  // Shorter height
              borderRadius: "50%", // Ellipse shape
              border: "2px solid black",
              backgroundColor: "transparent",
              position: "absolute",
              left: `${x - 60}px`, // Centered at click position
              top: `${y - 40}px`,
            },
          },
        },
      });
      break;
    }


    case "arrow": {
      const mouseEvent = window.event as MouseEvent; // Get the last mouse event globally
      const x = mouseEvent?.clientX || 100; // Default to 100 if undefined
      const y = mouseEvent?.clientY || 100;
    
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            id: uuidv4(),
            name: "Arrow",
            type: "arrow",
            content: [],
            styles: {
              width: "80px", // Arrow width
              height: "2px", // Thin line for arrow body
              position: "absolute",
              left: `${x - 40}px`, // Centered at click position
              top: `${y}px`,
              backgroundColor: "black", // Arrow line color
              transform: "rotate(0deg)", // Can later be rotated
            },
          },
        },
      });
      break;
    }
    
    
    
    

    case "rectangle": {
      const mouseEvent = window.event as MouseEvent; // Get the last mouse event globally
      const x = mouseEvent?.clientX || 100; // Default to 100 if undefined
      const y = mouseEvent?.clientY || 100;
    
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            id: uuidv4(),
            name: "Rectangle",
            type: "rectangle",
            content: [],
            styles: {
              width: "120px",
              height: "80px",
              border: "2px solid black",
              backgroundColor: "transparent",
              position: "absolute",
              left: `${x - 60}px`, // Centered at click position
              top: `${y - 40}px`,
            },
          },
        },
      });
      break;
    }
    
    

   
    case "contactForm": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: {
              formTitle: "Contact Form",
              formDescription: "Get in touch",
              formButton: "Submit",
            },
            id: uuidv4(),
            name: "Contact Form",
            styles: {},
            type: "contactForm",
          },
        },
      });

      break;
    }
    case "paymentForm": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [],
            id: uuidv4(),
            name: "Payment",
            styles: {},
            type: "paymentForm",
          },
        },
      });

      break;
    }
    case "2Col": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
            ],
            id: uuidv4(),
            name: "Two Columns",
            styles: { ...defaultStyles, display: "flex" },
            type: "2Col",
          },
        },
      });

      break;
    }
    case "3Col": {
      dispatch({
        type: "ADD_ELEMENT",
        payload: {
          containerId: id,
          elementDetails: {
            content: [
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
              {
                content: [],
                id: uuidv4(),
                name: "Container",
                styles: { ...defaultStyles, width: "100%" },
                type: "container",
              },
            ],
            id: uuidv4(),
            name: "Three Columns",
            styles: { ...defaultStyles, display: "flex" },
            type: "3Col",
          },
        },
      });

      break;
    }
  }
};
