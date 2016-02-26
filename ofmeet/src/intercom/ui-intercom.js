(function () {
	var importDoc = document.currentScript.ownerDocument;
	var proto = Object.create( HTMLElement.prototype );
		
	proto.createdCallback = function() {
		var that = this;
		var template = importDoc.querySelector('#intercomTemplate');		
		this.readAttributes();

		this.shadow = this.createShadowRoot();
		this.shadow.appendChild(template.content.cloneNode(true)); 		
	};

	proto.readAttributes = function() {

	};

	proto.attributeChangedCallback = function( attrName, oldVal, newVal ) {

	};	
	
	document.registerElement( "ui-intercom", {prototype: proto});
})(window);