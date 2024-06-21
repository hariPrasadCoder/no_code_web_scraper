function getHighlightedTextWithHTML() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const { startContainer, endContainer } = range;
      let startElement = startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentElement : startContainer;
      let endElement = endContainer.nodeType === Node.TEXT_NODE ? endContainer.parentElement : endContainer;

      // Function to get all attributes of an element
      const getAttributes = (element) => {
          const attributes = {};
          for (let attr of element.attributes) {
              attributes[attr.name] = attr.value;
          }
          return attributes;
      };

      // Function to get element info including HTML and attributes
      const getElementInfo = (element) => {
          return {
              tagName: element.tagName.toLowerCase(),
              attributes: getAttributes(element),
              outerHTML: element.outerHTML
          };
      };

      // Function to get parent elements
      const getParents = (element, levels) => {
          let parents = [];
          let currentElement = element;
          for (let i = 0; i < levels && currentElement.parentElement; i++) {
              currentElement = currentElement.parentElement;
              parents.push(getElementInfo(currentElement));
          }
          return parents;
      };

      const startParents = getParents(startElement, 2);
      const endParents = getParents(endElement, 2);

      return {
          text: selection.toString().trim(),
          html: range.cloneContents().textContent,
          startElement: getElementInfo(startElement),
          endElement: getElementInfo(endElement),
          startParents: startParents,
          endParents: endParents
      };
  }
  return { text: '', html: '', startElement: {}, endElement: {}, startParents: [], endParents: [] };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getHighlightedTextWithHTML") {
      sendResponse(getHighlightedTextWithHTML());
  }
});

// Notify that the content script has been injected
chrome.runtime.sendMessage({action: "contentScriptReady"});