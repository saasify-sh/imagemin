import fs from 'fs';
import path from 'path';
import imageminJpegtran from 'imagemin-jpegtran';
import isJpg from 'is-jpg';
import pify from 'pify';
import test from 'ava';
import m from './';

const fsP = pify(fs);

test('optimize a file', async t => {
	const buf = await fsP.readFile(path.join(__dirname, 'fixture.jpg'));
	const files = await m(['fixture.jpg'], {plugins: imageminJpegtran()});

	t.is(files[0].path, null);
	t.true(files[0].data.length < buf.length);
	t.true(isJpg(files[0].data));
});

test('optimize a buffer', async t => {
	const buf = await fsP.readFile(path.join(__dirname, 'fixture.jpg'));
	const data = await m.buffer(buf, {plugins: imageminJpegtran()});

	t.true(data.length < buf.length);
	t.true(isJpg(data));
});

test('output error on corrupt images', async t => {
	t.throws(m(['fixture-corrupt.jpg'], {plugins: imageminJpegtran()}), /Corrupt JPEG data/);
});

test('throw on wrong input', async t => {
	t.throws(m('foo'), /Expected an array/);
	t.throws(m.buffer('foo'), /Expected a buffer/);
});

test('return original file if no plugins are defined', async t => {
	const buf = await fsP.readFile(path.join(__dirname, 'fixture.jpg'));
	const files = await m(['fixture.jpg']);

	t.is(files[0].path, null);
	t.deepEqual(files[0].data, buf);
	t.true(isJpg(files[0].data));
});

test('return original buffer if no plugins are defined', async t => {
	const buf = await fsP.readFile(path.join(__dirname, 'fixture.jpg'));
	const data = await m.buffer(buf);

	t.deepEqual(data, buf);
	t.true(isJpg(data));
});