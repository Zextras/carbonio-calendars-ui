/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useRef, useState, useContext, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { map, filter, reduce, uniqBy, find } from 'lodash';
import {
	Container,
	Icon,
	IconButton,
	Padding,
	Link,
	Row,
	Text,
	Tooltip,
	useTheme,
	ContainerProps,
	TextProps
} from '@zextras/carbonio-design-system';
import { PreviewsManagerContext } from '@zextras/carbonio-ui-preview';
import { getFileExtension, calcColor } from '../../commons/utilities';
import { humanFileSize, previewType } from '../../commons/file-preview';

const getAttachmentsLink = (
	messageId: string,
	messageSubject: string,
	attachments: Array<string>
): string => {
	if (attachments.length > 1) {
		return `/service/home/~/?auth=co&id=${messageId}&filename=${messageSubject}&charset=UTF-8&part=${attachments.join(
			','
		)}&disp=a&fmt=zip`;
	}
	return `/service/home/~/?auth=co&id=${messageId}&part=${attachments.join(',')}&disp=a`;
};

const AttachmentHoverBarContainer = styled(Container)`
	display: none;
	height: 0;
`;

const AttachmentContainer = styled(Container)<
	ContainerProps & { isComplete: boolean; disabled: boolean }
>`
	border-radius: 2px;
	width: ${({ isComplete }): string => (isComplete ? 'calc(25% - 8px)' : 'calc(50% - 8px)')};
	transition: 0.2s ease-out;
	margin-bottom: ${({ theme }): string => theme.sizes.padding.small};
	margin-right: ${({ theme }): string => theme.sizes.padding.small};
	box-sizing: border-box;
	&:hover {
		background-color: ${({ theme, background = 'transparent', disabled }): string =>
			disabled ? 'gray5' : theme.palette[background].hover};
		& ${AttachmentHoverBarContainer} {
			display: flex;
		}
	}
	&:focus {
		background-color: ${({ theme, background = 'transparent' }): string =>
			theme.palette[background].focus};
	}
	cursor: ${({ disabled }): string => (disabled ? 'default' : 'pointer')};
`;

const AttachmentLink = styled.a`
	margin-bottom: ${({ theme }): string => theme.sizes.padding.small};
	position: relative;
	text-decoration: none;
`;

const AttachmentExtension = styled(Text)<
	TextProps & { background?: { extension: string; color: string } }
>`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 32px;
	height: 32px;
	border-radius: ${({ theme }): string => theme.borderRadius};
	background-color: ${({ theme, disabled, background }): string =>
		disabled ? theme.palette.primary.disabled : background?.color || theme.palette.primary.regular};
	color: ${({ theme }): string => theme.palette.gray6.regular};
	font-size: calc(${({ theme }): string => theme.sizes.font.small} - 2px);
	text-transform: uppercase;
	margin-right: ${({ theme }): string => theme.sizes.padding.small};
`;

type AttachmentProps = {
	link: string;
	id: string;
	part: string;
	isEditor: boolean;
	isComplete: boolean;
	removeAttachment: (arg: string) => void;
	disabled: boolean;
	iconColors: Array<{
		extension: string;
		color: string;
	}>;
	att: any;
};

const Attachment = ({
	link,
	id,
	part,
	isEditor,
	removeAttachment,
	isComplete,
	disabled = false,
	iconColors,
	att
}: AttachmentProps): ReactElement => {
	const { createPreview } = useContext(PreviewsManagerContext);
	const extension = getFileExtension(att);
	const sizeLabel = useMemo(() => humanFileSize(att.size), [att.size]);
	const [t] = useTranslation();
	const inputRef = useRef<HTMLAnchorElement>(null);
	const inputRef2 = useRef<HTMLAnchorElement>(null);
	const downloadAttachment = useCallback(() => {
		if (inputRef?.current) {
			inputRef.current.click();
		}
	}, [inputRef]);

	const preview = useCallback(
		(ev) => {
			ev.preventDefault();
			const pType = previewType(att.contentType);
			if (pType) {
				createPreview({
					src: link,
					previewType: pType,
					/** Left Action for the preview */
					closeAction: {
						id: 'close',
						icon: 'ArrowBack',
						tooltipLabel: t('preview.close', 'Close Preview')
					},
					/** Actions for the preview */
					// actions: HeaderAction[],
					/** Extension of the file, shown as info */
					extension: att.filename.substring(att.filename.lastIndexOf('.') + 1),
					/** Name of the file, shown as info */
					filename: att.filename,
					/** Size of the file, shown as info */
					size: humanFileSize(att.size)
				});
			} else if (inputRef2.current) {
				inputRef2.current.click();
			}
		},
		[att, createPreview, link, t]
	);
	return (
		<AttachmentContainer
			orientation="horizontal"
			mainAlignment="flex-start"
			height="fit"
			background={disabled ? 'gray5' : 'gray3'}
			isComplete={isComplete}
			disabled={disabled}
			padding={{ right: 'medium' }}
		>
			<Tooltip
				key={isEditor ? `${id}-Edit` : `${id}-Preview`}
				label={
					disabled
						? t('action.save_to_preview', 'Save to preview')
						: t('action.preview', 'Click to preview')
				}
			>
				<Row
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					onClick={preview}
					takeAvailableSpace
				>
					<AttachmentExtension
						background={find(iconColors, (ic) => ic.extension === extension)}
						disabled={disabled}
					>
						{extension}
					</AttachmentExtension>
					<Row orientation="vertical" crossAlignment="flex-start" takeAvailableSpace>
						<Padding style={{ width: '100%' }} bottom="extrasmall">
							<Text disabled={disabled}>{att.filename}</Text>
						</Padding>
						<Text disabled={disabled} color="gray1" size="small">
							{sizeLabel}
						</Text>
					</Row>
				</Row>
			</Tooltip>
			<Row orientation="horizontal" crossAlignment="center">
				<AttachmentHoverBarContainer orientation="horizontal">
					{disabled ? (
						<Tooltip key={`${id}-DeletePermanentlyOutline`} label={t('label.delete', 'Delete')}>
							<IconButton
								size="medium"
								icon={'DeletePermanentlyOutline'}
								onClick={(): void => removeAttachment(part)}
							/>
						</Tooltip>
					) : (
						<Tooltip
							key={isEditor ? `${id}-EditOutline` : `${id}-DeletePermanentlyOutline`}
							label={isEditor ? t('label.delete', 'Delete') : t('label.download', 'Download')}
						>
							<IconButton
								size="medium"
								icon={isEditor ? 'DeletePermanentlyOutline' : 'DownloadOutline'}
								onClick={isEditor ? (): void => removeAttachment(part) : downloadAttachment}
							/>
						</Tooltip>
					)}
				</AttachmentHoverBarContainer>
			</Row>
			{!disabled && (
				<AttachmentLink
					rel="noopener"
					ref={inputRef2}
					target="_blank"
					href={`/service/home/~/?auth=co&id=${id}&part=${part}`}
				/>
			)}
			<AttachmentLink ref={inputRef} rel="noopener" target="_blank" href={link} />
		</AttachmentContainer>
	);
};

type AttachmentsBlockProps = {
	attachments: Array<{
		part: any;
		mid: string;
		filename: string;
		contentType: string;
		name: string;
		aid?: string;
	}>;
	id: string;
	subject: string;
	onAttachmentsChange?: (
		arg1: { aid?: string[]; mp: Array<{ part: any; mid: string }> },
		arg2: any,
		arg3: any
	) => void;
	isEditor?: boolean;
	isComplete?: boolean;
};

export const AttachmentsBlock = ({
	attachments,
	id,
	subject,
	onAttachmentsChange,
	isEditor = false,
	isComplete = false
}: AttachmentsBlockProps): ReactElement => {
	const [t] = useTranslation();
	const [expanded, setExpanded] = useState(false);
	const theme = useTheme();
	const attachmentsCount = useMemo(() => attachments.length, [attachments]);
	const attachmentsParts = useMemo(() => map(attachments, 'name'), [attachments]);
	const actionsDownloadLink = useMemo(
		() => getAttachmentsLink(id, subject, attachmentsParts),
		[attachmentsParts, id, subject]
	);

	const removeAttachment = useCallback(
		(part) => {
			const attachmentFiles = filter(attachments, (p) =>
				p.name ? p.name !== part : !p.aid || p.aid !== part
			);
			if (onAttachmentsChange) {
				onAttachmentsChange(
					{
						aid: reduce(
							attachmentFiles,
							(acc, item) => (item.aid ? [...acc, item.aid] : acc),
							[] as string[]
						),
						mp: reduce(
							attachmentFiles,
							(acc, item) => (item.name ? [...acc, { part: item.name, mid: id }] : acc),
							[] as Array<{ part: any; mid: string }>
						)
					},
					attachmentFiles,
					true
				);
			}
		},
		[attachments, id, onAttachmentsChange]
	);

	const removeAllAttachments = useCallback(() => {
		if (onAttachmentsChange) {
			onAttachmentsChange({ mp: [] }, [], true);
		}
	}, [onAttachmentsChange]);
	const attachToVisualize = useMemo(() => {
		if (!expanded && isComplete) return attachments.slice(0, 4);
		if (!expanded && !isComplete) return attachments.slice(0, 2);
		return attachments;
	}, [attachments, expanded, isComplete]);

	const iconColors = useMemo(
		() =>
			uniqBy(
				map(attachments, (att) => {
					const fileExtn = getFileExtension(att);
					const color = calcColor(att.contentType, theme);

					return {
						extension: fileExtn,
						color
					};
				}),
				'extension'
			),
		[attachments, theme]
	);

	return (
		<>
			{attachmentsCount > 0 && (
				<Container mainAlignment="flex-start" crossAlignment="flex-start">
					<Row mainAlignment="flex-start" padding={{ top: 'extrasmall', bottom: 'medium' }}>
						<Padding right="small">
							{attachmentsCount < 3 && attachmentsCount > 1 && (
								<Text color="gray1">
									{t('label.attachment', {
										count: attachmentsCount,
										defaultValue: 'Attachment',
										defaultValue_plural: '{{count}} Attachments'
									})}
								</Text>
							)}
							{attachmentsCount === 1 && (
								<Text color="gray1">{`1 ${t('label.attachment', {
									count: attachmentsCount,
									defaultValue: 'Attachment',
									defaultValue_plural: '{{count}} Attachments'
								})}`}</Text>
							)}
							{attachmentsCount > 2 &&
								(expanded ? (
									<Row onClick={(): void => setExpanded(false)} style={{ cursor: 'pointer' }}>
										<Padding right="small">
											<Text color="primary">
												{t('label.attachment', {
													count: attachmentsCount,
													defaultValue: 'Attachment',
													defaultValue_plural: '{{count}} Attachments'
												})}
											</Text>
										</Padding>
										<Icon icon="ArrowIosUpward" color="primary" />
									</Row>
								) : (
									<Row onClick={(): void => setExpanded(true)} style={{ cursor: 'pointer' }}>
										<Padding right="small">
											<Text color="primary">
												{t('label.show', {
													count: attachmentsCount,
													defaultValue: 'Show',
													defaultValue_plural: 'Show all'
												})}{' '}
												{t('label.attachment', {
													count: attachmentsCount,
													defaultValue: 'Attachment',
													defaultValue_plural: '{{count}} Attachments'
												})}
											</Text>
										</Padding>
										<Icon icon="ArrowIosDownward" color="primary" />
									</Row>
								))}
						</Padding>
						<Link
							size="medium"
							href={isEditor ? undefined : actionsDownloadLink}
							onClick={isEditor ? removeAllAttachments : undefined}
						>
							{isEditor
								? t('label.delete', {
										count: attachmentsCount,
										defaultValue: 'Delete',
										defaultValue_plural: 'Delete all'
								  })
								: t('label.download', {
										count: attachmentsCount,
										defaultValue: 'Download',
										defaultValue_plural: 'Download all'
								  })}
						</Link>
					</Row>

					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						wrap="wrap"
					>
						{map(attachToVisualize, (att, index) => (
							<Attachment
								key={`att-${att.filename}-${index}`}
								link={getAttachmentsLink(id, subject, [att.name])}
								id={id}
								part={att.name ?? att.aid}
								isEditor={isEditor}
								isComplete={isComplete}
								removeAttachment={removeAttachment}
								disabled={!att.name}
								iconColors={iconColors}
								att={att}
							/>
						))}
					</Container>
				</Container>
			)}
		</>
	);
};
