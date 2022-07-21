/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getShareInfoRequest = async (): Promise<any> =>
	soapFetch('GetShareInfo', {
		_jsns: 'urn:zimbraAccount',
		includeSelf: 0
	});
