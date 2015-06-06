QUnit.module("isEmpty()");
QUnit.test("isEmpty()", function( assert ) {
    assert.ok(isEmpty({}), "Empty Literal Object");
    assert.ok(isEmpty({"": ""}), "False Non Empty Literal Object (1 field)");
    assert.ok(isEmpty({"": "", "": ""}), "False Non Empty Literal Object (2 fields)");
    assert.notOk(isEmpty({a: "b"}), "Not Empty Literal Object");
});

QUnit.module("isValidTag()");
QUnit.test("isValidTag()", function( assert ) {
    assert.notOk(isValidTag(), "Undefined tag");
    assert.notOk(isValidTag(""), "Empty tag");
    assert.notOk(isValidTag(" "), "Whitespace tag");
    assert.notOk(isValidTag("a"), "Alphanumeric tag");
    assert.notOk(isValidTag("12_5"), "Symbolic tag");
    assert.ok(isValidTag("1"), "Valid tag");
    assert.ok(isValidTag("1 "), "Valid tag with traling spaced (after)");
    assert.ok(isValidTag(" 1"), "Valid tag with traling spaced (before)");
    assert.ok(1, "Integer type tag");
});

QUnit.module( "addTag()", {
	beforeEach: function() {
		this.fixMessage = {};
	}
});

QUnit.test("addTag()", function( assert ) {
	addTag(this.fixMessage, "1", "value");
	assert.deepEqual(this.fixMessage, { "1": "value" }, "Valid add");
});

QUnit.test("addTag()", function( assert ) {
	addTag(this.fixMessage, "1", "value");
	addTag(this.fixMessage, "1", "value_1");
	assert.deepEqual(this.fixMessage, { "1": "value", "1_1": "value_1" }, "Same tag add");
});

QUnit.test("addTag()", function( assert ) {
	assert.throws(function () {
		addTag(undefined, "1", "value");
	}, "undefined fixMessage");
});