document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          function: getHighlightedTextWithHTML,
      }, (results) => {
          const textElement = document.getElementById('highlightedText');
          const htmlElement = document.getElementById('highlightedHTML');
          const startElementInfo = document.getElementById('startElementInfo');
          const endElementInfo = document.getElementById('endElementInfo');
          const parentsInfo = document.getElementById('parentsInfo');
          
          if (chrome.runtime.lastError) {
              textElement.textContent = "Error: " + chrome.runtime.lastError.message;
          } else if (results && results[0] && results[0].result) {
              const { text, html, startElement, endElement, startParents, endParents } = results[0].result;
              textElement.textContent = text || "No text highlighted.";
              htmlElement.textContent = html || "No HTML captured.";
              
              startElementInfo.textContent = JSON.stringify(startElement, null, 2);
              endElementInfo.textContent = JSON.stringify(endElement, null, 2);
              
              parentsInfo.textContent = JSON.stringify({
                  startParents: startParents,
                  endParents: endParents
              }, null, 2);
          } else {
              textElement.textContent = "No text highlighted. Please select some text and try again.";
              htmlElement.textContent = "No HTML captured.";
              startElementInfo.textContent = "No start element info captured.";
              endElementInfo.textContent = "No end element info captured.";
              parentsInfo.textContent = "No parent elements captured.";
          }
      });
  });
});

// This function is executed in the context of the web page
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