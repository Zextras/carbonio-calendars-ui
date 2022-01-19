/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { forEach, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Container, Text } from '@zextras/carbonio-design-system';

const _CI_REGEX = /^<(.*)>$/;
const _CI_SRC_REGEX = /^cid:(.*)$/;

function TextMessageRenderer({ text }) {
	const containerRef = useRef();

	useEffect(() => {
		containerRef.current.innerText = text;
	}, [text]);

	return <Text ref={containerRef} />;
}

function HtmlMessageRenderer({ msgId, body, parts }) {
	const iframeRef = useRef();
	const onIframeLoad = useCallback((ev) => {
		ev.persist();
		const styleTag = document.createElement('style');
		const styles = `
			body {
				margin: 0;
				overflow-y: hidden;
				font-family: Roboto, sans-serif;
				font-size: 14px;
			}
			body pre, body pre * {
				white-space: pre-wrap;
				word-wrap: break-word !important;
				text-wrap: suppress !important;
			}
			img {
				max-width: 100%
			}
		`;
		styleTag.textContent = styles;
		iframeRef.current.contentDocument.head.append(styleTag);
		iframeRef.current.style.display = 'block';
		iframeRef.current.style.height = `${
			iframeRef.current.contentDocument.body.querySelector('div').scrollHeight
		}px`;
	}, []);

	useEffect(() => {
		iframeRef.current.contentDocument.open();
		iframeRef.current.contentDocument.write(`<div>${body}</div>`);
		iframeRef.current.contentDocument.close();
		const imgMap = reduce(
			parts,
			(r, v) => {
				if (!_CI_REGEX.test(v.ci)) return r;
				r[_CI_REGEX.exec(v.ci)[1]] = v;
				return r;
			},
			{}
		);

		const images = iframeRef.current.contentDocument.body.getElementsByTagName('img');

		forEach(images, (p) => {
			if (p.hasAttribute('dfsrc')) {
				p.setAttribute('src', p.getAttribute('dfsrc'));
			}
			if (!_CI_SRC_REGEX.test(p.src)) return;
			const ci = _CI_SRC_REGEX.exec(p.getAttribute('src'))[1];
			if ({}.hasOwnProperty.call(imgMap, ci)) {
				const part = imgMap[ci];
				p.setAttribute('pnsrc', p.getAttribute('src'));
				p.setAttribute('src', `/service/home/~/?auth=co&id=${msgId}&part=${part.name}`);
			}
		});
	}, [body, parts, msgId]);

	return (
		<div className="force-white-bg" style={{ width: '100%' }}>
			<iframe
				title={msgId}
				ref={iframeRef}
				onLoad={onIframeLoad}
				style={{ border: 'none', width: '100%', display: 'none' }}
			/>
		</div>
	);
}

const EmptyBody = () => {
	const [t] = useTranslation();

	return (
		<Container padding={{ bottom: 'medium' }}>
			<Text>{`(${t('message.invite_has_no_message', 'This invite has no text message')}.)`}</Text>
		</Container>
	);
};

const divider = '*~*~*~*~*~*~*~*~*~*';
export function extractBody(body) {
	if (body) {
		const lastElement = body.split(divider).pop();
		return lastElement.trim();
	}
	return '';
}

export function extractHtmlBody(body) {
	let htmlBody = extractBody(body);
	if (htmlBody.startsWith('</div>')) {
		htmlBody = `<html>${htmlBody.slice(10)}`;
	}
	return htmlBody;
}

export function extractZimbraHeader(body) {
	if (body) {
		const lastElement = body.split(divider).first();
		return lastElement.trim();
	}
	return '';
}

export function extractZimbraHtmlHeader(body) {
	if (body) {
		const lastElement = body.split(divider).first();
		return lastElement.trim();
	}
	return '';
}

export default function BodyMessageRenderer({ fullInvite, inviteId, parts }) {
	if (!fullInvite) return null;
	if (typeof fullInvite.fragment === 'undefined') {
		return <EmptyBody />;
	}
	if (fullInvite?.htmlDescription) {
		return (
			<HtmlMessageRenderer
				msgId={inviteId}
				body={extractHtmlBody(fullInvite?.htmlDescription?.[0]?._content)}
				parts={parts}
			/>
		);
	}
	return <TextMessageRenderer text={extractBody(fullInvite?.textDescription?.[0]?._content)} />;
}
