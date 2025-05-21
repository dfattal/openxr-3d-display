Make the supported fields on xrt_device be a struct. This makes it trivial for
the IPC layer to correctly expose the supported functionality and methods of the
device. There were multiple cases where fields were missed in the IPC layer.
