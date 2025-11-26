export class StreamIn {
	private buffer: Uint8Array;
	private view: DataView;
	public pos: number;

	constructor(buffer: ArrayBuffer | Uint8Array | Buffer) {
		if (typeof Buffer !== 'undefined' && Buffer.isBuffer(buffer)) {
			this.buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
		} else {
			this.buffer = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
		}

		this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
		this.pos = 0;
	}

	public skip(length: number): void {
		this.pos += length;
	}

	public seek(pos: number): void {
		this.pos = pos;
	}

	public readBytes(length: number): Uint8Array {
		const bytes = this.buffer.subarray(this.pos, this.pos + length);
		this.pos += length;

		return bytes;
	}

	public readBoolean(): boolean {
		const value = this.view.getUint8(this.pos);
		this.pos += 1;

		return value !== 0;
	}

	public readUint8(): number {
		const value = this.view.getUint8(this.pos);
		this.pos += 1;

		return value;
	}

	public readUint16LE(): number {
		const value = this.view.getUint16(this.pos, true);
		this.pos += 2;

		return value;
	}

	public readUint16BE(): number {
		const value = this.view.getUint16(this.pos, false);
		this.pos += 2;

		return value;
	}

	public readUint32LE(): number {
		const value = this.view.getUint32(this.pos, true);
		this.pos += 4;

		return value;
	}

	public readUint32BE(): number {
		const value = this.view.getUint32(this.pos, false);
		this.pos += 4;

		return value;
	}

	public readInt8(): number {
		const value = this.view.getInt8(this.pos);
		this.pos += 1;

		return value;
	}

	public readInt16LE(): number {
		const value = this.view.getInt16(this.pos, true);
		this.pos += 2;

		return value;
	}

	public readInt16BE(): number {
		const value = this.view.getInt16(this.pos, false);
		this.pos += 2;

		return value;
	}

	public readInt32LE(): number {
		const value = this.view.getInt32(this.pos, true);
		this.pos += 4;

		return value;
	}

	public readInt32BE(): number {
		const value = this.view.getInt32(this.pos, false);
		this.pos += 4;

		return value;
	}

	public readInt64LE(): bigint {
		const value = this.view.getBigInt64(this.pos, true);
		this.pos += 8;

		return value;
	}

	public readInt64BE(): bigint {
		const value = this.view.getBigInt64(this.pos, false);
		this.pos += 8;

		return value;
	}
}
