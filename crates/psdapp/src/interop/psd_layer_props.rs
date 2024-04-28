use serde::ser::{Serialize, SerializeMap};
#[derive(Debug)]
pub struct PsdLayerProps<'a>(pub &'a psd::PsdLayer);

macro_rules! ser {
    ($map: ident, $me: expr; $($id: ident),*) => {
        $(
            $map.serialize_entry(stringify!($id), &($me.$id()))?;
        )*
    };
}

impl<'a> Serialize for PsdLayerProps<'a> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut map = serializer.serialize_map(None)?;
        ser!(
            map, self.0;
            name,
            layer_top, layer_left, layer_bottom, layer_right,
            visible,opacity, is_clipping_mask,
            parent_id
        );

        let blend_mode = self.0.blend_mode() as usize;
        map.serialize_entry("blend_mode", &blend_mode)?;

        map.end()
    }
}
