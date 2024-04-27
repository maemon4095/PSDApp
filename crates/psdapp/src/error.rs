use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct AnyError(JsValue);

impl AnyError {
    pub fn from_jsvalue(v: JsValue) -> AnyError {
        Self(v)
    }

    pub fn as_jsvalue(&self) -> &JsValue {
        &self.0
    }
}

impl<T: std::error::Error> From<T> for AnyError {
    fn from(value: T) -> Self {
        Self(value.to_string().into())
    }
}

#[derive(Debug)]
pub struct PsdAppNotInitializedError;

impl std::error::Error for PsdAppNotInitializedError {}

impl std::fmt::Display for PsdAppNotInitializedError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "PSDApp was not initialized.")
    }
}
