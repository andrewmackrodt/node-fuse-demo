import type { Stats as FileStat, FSStat } from 'node-fuse-bindings'

/**
 * Interface representing a FUSE (Filesystem in Userspace) file system. This defines the set of
 * operations that can be implemented to interact with a virtual filesystem.
 *
 * Documentation for this file is AI Generated and may contain errors.
 */
export interface FileSystemAdapter {
    /**
     * Checks the accessibility of a file or directory at the specified path with the given mode.
     *
     * @param {string} path - The file or directory path to check.
     * @param {number} mode - The accessibility check mode. It can be a combination of constants
     *   such as fs.constants.R_OK, fs.constants.W_OK, etc.
     *
     * @returns {Promise<void>} A Promise that resolves if the file or directory is accessible, or
     *   rejects with an error if it is not.
     *
     * @throws {FuseError}
     */
    access?(path: string, mode: number): Promise<void>

    /**
     * Changes the permissions of a file or directory specified by the given path.
     *
     * @param {string} path - The path to the file or directory whose permissions are to be changed.
     * @param {number} mode - The numeric representation of the new permissions to set.
     *
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     *
     * @throws {FuseError}
     */
    chmod?(path: string, mode: number): Promise<void>

    /**
     * Changes the ownership of a file or directory at the specified path.
     *
     * @param {string} path - The path to the file or directory whose ownership is to be changed.
     * @param {number} uid - The user ID of the new owner.
     * @param {number} gid - The group ID of the new owner.
     *
     * @returns {Promise<void>} A promise that resolves when the ownership change is complete.
     *
     * @throws {FuseError}
     */
    chown?(path: string, uid: number, gid: number): Promise<void>

    /**
     * Creates a new file at the specified path with the given mode.
     *
     * @param {string} path - The file system path where the file will be created.
     * @param {number} mode - The mode to set for the created file.
     *
     * @returns {Promise<void>} A promise that resolves when the creation is complete.
     *
     * @throws {FuseError}
     */
    create?(path: string, mode: number): Promise<void>

    /**
     * This method is called before the filesystem is unmounted.
     *
     * @returns {Promise<void>} A promise that resolves when the filesystem is about to be
     *   unmounted.
     *
     * @throws {FuseError}
     */
    destroy?(): Promise<void>

    /**
     * Retrieves attributes for a file or directory at the specified path.
     *
     * This method fetches metadata about the specified path or file descriptor and returns a
     * Promise that resolves with a `Stats` object containing the detailed attributes.
     *
     * @param {string} path - The path to the file or directory for which attributes are being
     *   retrieved.
     * @param {number} fd - The file descriptor associated with the file, if applicable.
     *
     * @returns {Promise<Stats>} A Promise that resolves with the file or directory's metadata
     *   encapsulated in a `Stats` object.
     *
     * @throws {FuseError}
     */
    fgetattr?(path: string, fd: number): Promise<FileStat>

    /**
     * Flushes the content of a specific file descriptor to disk, ensuring all written data is
     * saved.
     *
     * @param {string} path - The path of the file to be flushed.
     * @param {number} fd - The file descriptor associated with the file.
     *
     * @returns {Promise<void>} A promise that resolves when the flush operation is complete.
     *
     * @throws {FuseError}
     */
    flush?(path: string, fd: number): Promise<void>

    /**
     * Ensures that changes made to a file are physically written to the storage device. This
     * process can be essential to guarantee data integrity in case of system crashes or power
     * failures.
     *
     * @param {string} path - The path to the file that should be synchronized to the storage
     *   device.
     * @param {number} fd - The file descriptor of the file to synchronize. It must be a valid and
     *   open file descriptor.
     * @param {number} datasync - If set to a non-zero value, the method will only synchronize file
     *   data, rather than also updating file metadata. A zero value ensures both data and metadata
     *   are written.
     *
     * @returns {Promise<void>} A promise that resolves when the synchronization operation is
     *   complete.
     *
     * @throws {FuseError}
     */
    fsync?(path: string, fd: number, datasync: number): Promise<void>

    /**
     * Synchronizes the contents of a directory to the filesystem, ensuring all changes are saved.
     *
     * @param {string} path - The path of the directory to synchronize.
     * @param {number} fd - The file descriptor of the directory to synchronize.
     * @param {number} datasync - If set to a non-zero value, only the directory data (not metadata)
     *   will be synchronized.
     *
     * @returns {Promise<void>} A promise that resolves when the synchronization operation is
     *   complete.
     *
     * @throws {FuseError}
     */
    fsyncdir?(path: string, fd: number, datasync: number): Promise<void>

    /**
     * Adjusts the size of the file associated with a given file descriptor to the specified size.
     *
     * @param {string} path - The path to the file whose size is to be truncated.
     * @param {number} fd - The file descriptor referencing the file to be truncated.
     * @param {number} size - The desired size of the file in bytes. If the file was previously
     *   larger than this size, it is truncated to fit. If the file was smaller, it is extended, and
     *   the added space is filled with null bytes.
     *
     * @returns {Promise<void>} A promise that resolves when the file has been successfully resized.
     *
     * @throws {FuseError}
     */
    ftruncate?(path: string, fd: number, size: number): Promise<void>

    /**
     * Retrieves the file or directory statistics for a given path.
     *
     * @param {string} path - The path of the file or directory for which the statistics are to be
     *   retrieved.
     *
     * @returns {Promise<Stats>} A promise that resolves to a `Stats` object containing information
     *   about the file or directory.
     *
     * @throws {FuseError}
     */
    getattr?(path: string): Promise<FileStat>

    /**
     * Retrieves the extended attribute of a file at the specified path.
     *
     * @param {string} path The file path from which the extended attribute is to be retrieved.
     * @param {string} name The name of the extended attribute to retrieve.
     * @param {Buffer} buffer The buffer used to store the attribute's data.
     * @param {number} length The maximum number of bytes to read from the extended attribute.
     * @param {number} offset The offset position within the attribute to begin reading.
     *
     * @returns {Promise<void>} A Promise that resolves when the operation completes successfully.
     *
     * @throws {FuseError}
     */
    getxattr?(path: string, name: string, buffer: Buffer, length: number, offset: number): Promise<void>

    /**
     * Called before the filesystem is mounted.
     *
     * This method is used to perform any necessary initialization tasks for the filesystem before
     * it becomes available to the system. Implementations can use this to set up internal state or
     * resources needed for operation.
     *
     * @returns {Promise<void>} A promise that resolves when the initialization process is complete.
     *
     * @throws {FuseError}
     */
    init?(): Promise<void>

    /**
     * Creates a symbolic link at the specified path, pointing to the target.
     *
     * @param path The file path where the symbolic link will be created.
     * @param target The target file or directory to which the link should point.
     *
     * @returns A promise that resolves when the symbolic link is successfully created, or rejects
     *   with an error if the operation fails.
     *
     * @throws {FuseError}
     */
    link?(path: string, target: string): Promise<void>

    /**
     * Called when extended attributes of a path are being listed.
     *
     * @param path
     * @param buffer Should be filled with the extended attribute names as null-terminated strings,
     *   one after the other, up to a total of length in length. (ERANGE should be passed to the
     *   callback if length is insufficient.)
     * @param length
     *
     * @returns The size of buffer required to hold all the names should be passed either on
     *   success, or if the supplied length was zero.
     *
     * @throws {FuseError}
     */
    listxattr?(path: string, buffer: Buffer, length: number): Promise<number>

    /**
     * Creates a new directory at the specified path with the given mode.
     *
     * @param {string} path - The path where the new directory should be created.
     * @param {number} mode - The permissions mode to set for the new directory.
     *
     * @returns {Promise<void>} A promise that resolves when the directory has been created
     *   successfully.
     *
     * @throws {FuseError}
     */
    mkdir?(path: string, mode: number): Promise<void>

    /**
     * Creates a file system node such as a file, device, or FIFO at the specified path.
     *
     * @param {string} path - The path at which the file system node will be created.
     * @param {number} mode - The mode specifying the permissions and type of the node to create.
     * @param {number} dev - The device identifier or major/minor numbers for special files.
     *
     * @returns {Promise<void>} A promise that resolves when the node is successfully created or
     *   rejects if an error occurs.
     *
     * @throws {FuseError}
     */
    mknod?(path: string, mode: number, dev: number): Promise<void>

    /**
     * Opens a file at the specified path with the given flags.
     *
     * @param {string} path - The path of the file to be opened.
     * @param {number} flags - The file system flags that determine the mode of opening the file.
     *
     * @returns {Promise<number>} A promise that resolves to a file descriptor for the opened file.
     *
     * @throws {FuseError}
     */
    open?(path: string, flags: number): Promise<number>

    /**
     * Opens a directory at the specified path with the given flags.
     *
     * @param {string} path - The path to the directory to be opened.
     * @param {number} flags - The flags that determine the behavior of the directory opening.
     *
     * @returns {Promise<number>} A promise that resolves to a file descriptor as a numeric value
     *   upon successfully opening the directory.
     *
     * @throws {FuseError}
     */
    opendir?(path: string, flags: number): Promise<number>

    /**
     * Reads data from a file at the specified path.
     *
     * @param {string} path - The path to the file to be read.
     * @param {number} fd - The file descriptor of the file to be read.
     * @param {Buffer} buffer - The buffer that the data will be read into.
     * @param {number} length - The number of bytes to read from the file.
     * @param {number} position - The position in the file to begin reading from. If null, the data
     *   will be read from the current position.
     *
     * @returns {Promise<number>} A promise that resolves to the number of bytes read.
     *
     * @throws {FuseError}
     */
    read?(path: string, fd: number, buffer: Buffer, length: number, position: number): Promise<number>

    /**
     * Reads the contents of a directory.
     *
     * @param {string} path - The path to the directory to be read.
     *
     * @returns {Promise<string[]>} A promise that resolves to an array of filenames in the
     *   directory.
     *
     * @throws {FuseError}
     */
    readdir?(path: string): Promise<string[]>

    /**
     * Resolves the symbolic link located at the specified path.
     *
     * @param {string} path - The path to the symbolic link to be resolved.
     *
     * @returns {Promise<string>} A promise that resolves to the resolved pathname of the symbolic
     *   link.
     *
     * @throws {FuseError}
     */
    readlink?(path: string): Promise<string>

    /**
     * Releases a previously acquired file descriptor for the specified path.
     *
     * This method is used to release system resources associated with the provided file descriptor.
     *
     * @param {string} path - The file path associated with the file descriptor to release.
     * @param {number} fd - The file descriptor to be released.
     *
     * @returns {Promise<void>} A promise that resolves when the release operation is complete.
     *
     * @throws {FuseError}
     */
    release?(path: string, fd: number): Promise<void>

    /**
     * Releases a directory by closing the file descriptor associated with it.
     *
     * @param {string} path - The path of the directory to be released.
     * @param {number} fd - The file descriptor representing the open directory.
     *
     * @returns {Promise<void>} A promise that resolves once the directory has been successfully
     *   released.
     *
     * @throws {FuseError}
     */
    releasedir?(path: string, fd: number): Promise<void>

    /**
     * Removes an extended attribute identified by its name from the specified file or directory
     * path.
     *
     * @param {string} path - The file or directory path from which the extended attribute will be
     *   removed.
     * @param {string} name - The name of the extended attribute to be removed.
     *
     * @returns {Promise<void>} A promise that resolves when the attribute has been successfully
     *   removed.
     *
     * @throws {FuseError}
     */
    removexattr?(path: string, name: string): Promise<void>

    /**
     * Renames a file or directory from the source path to the destination path.
     *
     * @param {string} src - The current path of the file or directory to rename.
     * @param {string} dest - The new path of the file or directory.
     *
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     *
     * @throws {FuseError}
     */
    rename?(src: string, dest: string): Promise<void>

    /**
     * Removes a directory at the specified path. This operation is asynchronous and returns a
     * promise that resolves when the directory is removed.
     *
     * @param {string} path - The path of the directory to be removed.
     *
     * @returns {Promise<void>} A promise that resolves when the directory is successfully removed.
     *
     * @throws {FuseError}
     */
    rmdir?(path: string): Promise<void>

    /**
     * Sets an extended attribute on a file or directory.
     *
     * @param {string} path - The path to the file or directory where the attribute will be set.
     * @param {string} name - The name of the extended attribute to set.
     * @param {Buffer} buffer - The buffer containing the data to be stored in the attribute.
     * @param {number} length - The number of bytes to write from the buffer to the attribute.
     * @param {number} offset - The offset within the buffer to start writing the data from.
     * @param {number} flags - The flags controlling the behavior of setting the attribute.
     *
     * @returns {Promise<void>} A promise that resolves when the attribute has been successfully
     *   set.
     *
     * @throws {FuseError}
     */
    setxattr?(path: string, name: string, buffer: Buffer, length: number, offset: number, flags: number): Promise<void>

    /**
     * Retrieves file system statistics for the given path.
     *
     * @param path The path of the file or directory whose file system statistics are to be
     *   retrieved.
     *
     * @returns A promise that resolves to an object containing file system statistics.
     *
     * @throws {FuseError}
     */
    statfs?(path: string): Promise<FSStat>

    /**
     * Creates a symbolic link at the specified path pointing to the target.
     *
     * @param {string} path - The location where the symbolic link will be created.
     * @param {string} target - The target file or directory that the symbolic link will point to.
     *
     * @returns {Promise<void>} A promise that resolves when the symbolic link has been successfully
     *   created.
     *
     * @throws {FuseError}
     */
    symlink?(path: string, target: string): Promise<void>

    /**
     * Truncates a file to a specified size.
     *
     * @param {string} path - The path of the file to be truncated.
     * @param {number} size - The new size of the file in bytes.
     *
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     *
     * @throws {FuseError}
     */
    truncate?(path: string, size: number): Promise<void>

    /**
     * Removes or unlinks the specified file or symbolic link at the given path.
     *
     * @param {string} path - The file system path of the file or symbolic link to be unlinked.
     *
     * @returns {Promise<void>} A Promise that resolves when the unlink operation is complete.
     *
     * @throws {FuseError}
     */
    unlink?(path: string): Promise<void>

    /**
     * Updates the access and modification times of a file identified by the given path.
     *
     * @param {string} path - The path to the file whose timestamps are to be updated.
     * @param {number} atime - The new access time as a Unix timestamp in seconds.
     * @param {number} mtime - The new modification time as a Unix timestamp in seconds.
     *
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     *
     * @throws {FuseError}
     */
    utimens?(path: string, atime: number, mtime: number): Promise<void>

    /**
     * Writes data from a buffer to a specified file at the given path and position.
     *
     * @param {string} path - The file path where the data will be written.
     * @param {number} fd - The file descriptor of the file.
     * @param {Buffer} buffer - The buffer containing the data to be written.
     * @param {number} length - The number of bytes to write from the buffer.
     * @param {number} position - The position in the file where writing should begin.
     *
     * @returns {Promise<number>} A promise that resolves to the number of bytes written.
     *
     * @throws {FuseError}
     */
    write?(path: string, fd: number, buffer: Buffer, length: number, position: number): Promise<number>
}
