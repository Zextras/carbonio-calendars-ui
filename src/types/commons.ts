/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ButtonProps, ContainerProps, TooltipProps } from '@zextras/carbonio-design-system';

export type ModalFooterProps = {
	mainAlignment?: ContainerProps['mainAlignment'] | undefined;
	crossAlignment?: ContainerProps['crossAlignment'] | undefined;
	padding?: Record<string, string> | undefined;
	onConfirm: () => void;
	secondaryAction?: () => void | undefined;
	label: string;
	secondaryLabel?: string | undefined;
	disabled?: boolean | undefined;
	secondaryDisabled?: boolean | undefined;
	background?: string | undefined;
	secondarybackground?: string | undefined;
	color?: string | undefined;
	secondaryColor?: string | undefined;
	width?: ButtonProps['width'];
	primaryBtnType?: ButtonProps['type'];
	secondaryBtnType?: ButtonProps['type'];
	showDivider?: boolean | undefined;
	primaryTooltip?:
		| {
				label: string;
				placement: TooltipProps['placement'];
				maxWidth: string;
		  }
		| undefined;
};
