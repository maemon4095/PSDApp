mod error;
mod interop;

use error::*;
use gloo::utils::format::JsValueSerdeExt;
use psd::Psd;
use std::sync::OnceLock;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

struct State {
    psd: Psd,
}

static STATE: OnceLock<State> = OnceLock::new();

#[wasm_bindgen]
pub async fn init(bytes: &[u8]) -> Result<(), String> {
    let psd = match Psd::from_bytes(bytes) {
        Ok(v) => v,
        Err(e) => return Err(e.to_string()),
    };

    let _ = STATE.set(State { psd });

    Ok(())
}

#[wasm_bindgen]
pub async fn get_layers(callback: &js_sys::Function) -> Result<(), AnyError> {
    let Some(state) = STATE.get() else {
        return Err(PsdAppNotInitializedError.into());
    };

    let layers = state.psd.layers();
    for layer in layers {
        let v = JsValue::from_serde(&interop::PsdLayerProps(layer))?;
        callback
            .call1(&JsValue::NULL, &v)
            .map_err(AnyError::from_jsvalue)?;
    }
    callback
        .call0(&JsValue::NULL)
        .map_err(AnyError::from_jsvalue)?;

    Ok(())
}

#[wasm_bindgen]
pub async fn get_groups(callback: &js_sys::Function) -> Result<(), AnyError> {
    let Some(state) = STATE.get() else {
        return Err(PsdAppNotInitializedError.into());
    };

    let groups = state.psd.groups();
    for group in groups.values() {
        let v = JsValue::from_serde(&interop::PsdGroupProps(group))?;
        callback
            .call1(&JsValue::NULL, &v)
            .map_err(AnyError::from_jsvalue)?;
    }
    callback
        .call0(&JsValue::NULL)
        .map_err(AnyError::from_jsvalue)?;

    Ok(())
}

#[wasm_bindgen]
pub fn draw_into() {}
