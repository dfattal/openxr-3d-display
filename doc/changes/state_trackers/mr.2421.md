### Changed
- In `oxr_session_update_action_bindings`, change the selection priority
  for dynamic roles to prioritize the device name
### Fixed
- Fixes a bug where `interaction_profile_find_in_session` would return
  unconditionally after finding the first profile. When multiple profiles
  share a name (e.g., `touch_plus` in both `XR_META_touch_controller_plus`
  and the OpenXR 1.1 core spec), only the first was ever considered.
