/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';
import { Dispatch } from 'redux';

export type ShareCalendarModalProps = {
	folder: any;
	closeFn?: any;
	onGoBack?: any;
	secondaryLabel?: string;
	isFromEditModal?: boolean;
};

export type ResponseActionsProps = {
	dispatch: Dispatch;
	t: TFunction;
	createSnackbar: any;
	zid: string;
	view: string;
	rid: string;
};

export type ShareCalendarUrlProps = {
	folder: any;
	onClose: () => void;
	isFromEditModal?: boolean;
};

export type UrlColumnProps = {
	label: string;
	tooltip: string;
	onUrlCopied: (label: string, type: string) => () => void;
	type: string;
};
