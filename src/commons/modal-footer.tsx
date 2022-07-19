/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/extensions */
import React, { FC, ReactElement } from 'react';
import { Container, Button, Padding, Divider, Tooltip } from '@zextras/carbonio-design-system';
import { ModalFooterProps } from '../types/commons';

const ModalFooter: FC<ModalFooterProps> = ({
	mainAlignment = 'center',
	crossAlignment = 'center',
	onConfirm,
	color = 'primary',
	label,
	secondaryAction,
	secondaryLabel = 'Cancel',
	primaryBtnType = 'default',
	secondaryBtnType = 'default',
	disabled,
	secondaryDisabled,
	background = 'primary',
	secondarybackground,
	secondaryColor = 'secondary',
	width = 'fit',
	showDivider = true,
	primaryTooltip
}): ReactElement => (
	<Container mainAlignment={mainAlignment} crossAlignment={crossAlignment}>
		{showDivider && (
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				orientation="horizontal"
				height="fit"
			>
				<Divider />
			</Container>
		)}
		<Container
			padding={{ top: 'small', bottom: 'small' }}
			mainAlignment="flex-end"
			crossAlignment="flex-start"
			orientation="horizontal"
			height="fit"
		>
			{secondaryAction && (
				<>
					<Button
						backgroundColor={secondarybackground}
						color={secondaryColor}
						type={secondaryBtnType}
						onClick={secondaryAction}
						label={secondaryLabel}
						disabled={secondaryDisabled}
						width={width}
					/>
					<Padding horizontal="extrasmall" />
				</>
			)}
			{primaryTooltip ? (
				<Tooltip
					label={primaryTooltip.label}
					placement={primaryTooltip.placement}
					maxWidth={primaryTooltip.maxWidth}
				>
					<Button
						width={width}
						color={color}
						onClick={onConfirm}
						label={label}
						type={primaryBtnType}
						disabled={disabled}
						backgroundColor={color || background}
					/>
				</Tooltip>
			) : (
				<Button
					width={width}
					color={color}
					onClick={onConfirm}
					label={label}
					type={primaryBtnType}
					disabled={disabled}
					backgroundColor={color || background}
				/>
			)}
		</Container>
	</Container>
);
export default ModalFooter;
